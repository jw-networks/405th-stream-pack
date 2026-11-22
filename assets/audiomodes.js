/* "Always heard" switches, shared by the Director and the Audio mixer.
   They flip the camera items inside the "AUDIO · always on (keep)" scene:
     item ON  = that person is always heard
     item OFF = that person is heard only while on screen (audio follows the picture)
   Groups: Hosts, Team A, Team B (team seats come from config.js → teams).  All / None set every group. */
window.AudioModes = function (mount, request, onChange) {
  const L = window.LAYOUTS;
  const GROUPS = [
    { key: "hosts", label: "Hosts", get seats() { return L.SEATS.filter(s => s.startsWith("host") && (!L.seatActive || L.seatActive(s))); } },
    { key: "a", label: (L.TEAMS.a && L.TEAMS.a.name) || "Team A", seats: L.TEAMS.a.seats, color: L.TEAMS.a.color },
    { key: "b", label: (L.TEAMS.b && L.TEAMS.b.name) || "Team B", seats: L.TEAMS.b.seats, color: L.TEAMS.b.color },
  ];
  if (!document.getElementById("am-style")) {
    const st = document.createElement("style"); st.id = "am-style";
    st.textContent = `
      .am { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: 12px; }
      .am .am-l { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin-right: 2px; }
      .am button { padding: 5px 9px; border: 0; cursor: pointer; background: #262626; color: #ddd; border-top: 2px solid var(--gc, #333);
                   font: 800 13px var(--font); font-variation-settings: "wdth" 75; letter-spacing: .06em; text-transform: uppercase; }
      .am button:hover { filter: brightness(1.2); }
      .am button.grp::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #555; margin-right: 6px; vertical-align: 1px; }
      .am button.grp.on { background: #1f3a2a; color: #fff; }
      .am button.grp.on::before { background: #3ddc84; box-shadow: 0 0 6px #3ddc84; }
      .am button.quick { background: #1c1c1c; color: #aaa; }
      .am .am-hint { color: #777; font-size: 11px; margin-left: 4px; }
      .am .am-miss { color: #777; font-size: 11px; }`;
    document.head.appendChild(st);
  }
  mount.classList.add("am");
  mount.innerHTML = `<span class="am-l">Always heard</span>` +
    GROUPS.map(g => `<button class="grp" data-g="${g.key}" ${g.color ? `style="--gc:${g.color}"` : ""}
       title="ON: ${g.label} always heard · OFF: heard only while on screen">${g.label}</button>`).join("") +
    `<button class="quick" data-q="all" title="Everyone always heard">All</button>
     <button class="quick" data-q="none" title="Only people on screen are heard">None</button>
     <span class="am-hint">others: only while on screen</span>`;
  let items = {};            // seat -> { id, on }
  const groupOn = g => g.seats.filter(s => items[s]).length > 0 && g.seats.filter(s => items[s]).every(s => items[s].on);
  function paint() {
    for (const g of GROUPS) {
      const b = mount.querySelector(`[data-g="${g.key}"]`);
      if (b) b.classList.toggle("on", groupOn(g));
    }
    onChange && onChange();
  }
  function load() {
    request("GetSceneItemList", { sceneName: L.AUDIO_SCENE }, r => {
      if (!r.requestStatus.result) {
        mount.innerHTML = `<span class="am-l">Always heard</span><span class="am-miss">Re-import the scene collection from setup.html to get the audio switches.</span>`;
        items = {}; onChange && onChange();
        return;
      }
      items = {};
      for (const it of r.responseData.sceneItems) {
        const seat = L.SEATS.find(s => "CAM · " + L.seatName(s) === it.sourceName);
        if (seat) items[seat] = { id: it.sceneItemId, on: !!it.sceneItemEnabled };
      }
      paint();
    });
  }
  function set(seats, on) {
    for (const s of seats) {
      const it = items[s]; if (!it || it.on === on) continue;
      it.on = on;
      request("SetSceneItemEnabled", { sceneName: L.AUDIO_SCENE, sceneItemId: it.id, sceneItemEnabled: on });
    }
    paint();
  }
  mount.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || !Object.keys(items).length) return;
    if (b.dataset.g) { const g = GROUPS.find(x => x.key === b.dataset.g); set(g.seats, !groupOn(g)); }
    if (b.dataset.q) set(L.SEATS.filter(s => b.dataset.q !== "all" || !L.seatActive || L.seatActive(s)), b.dataset.q === "all");
  });
  return {
    load,
    setSeats: set,                                          // set(seats, on): used by the Director's 1 / 2 hosts switch
    always: seat => !!(items[seat] && items[seat].on),     // is this seat heard even when off screen?
    known: () => Object.keys(items).length > 0,
    // feed OBS events (subscribe to SceneItems = 128) so several docks stay in sync
    onEvent(type, d) {
      if (type === "SceneItemEnableStateChanged" && d && d.sceneName === L.AUDIO_SCENE) {
        for (const it of Object.values(items)) if (it.id === d.sceneItemId) it.on = !!d.sceneItemEnabled;
        paint();
      }
    }
  };
};
