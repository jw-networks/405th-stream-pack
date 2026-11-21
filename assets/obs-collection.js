/* Builds an importable OBS scene collection (JSON) from LAYOUTS.
   Used by setup.html. Works in a browser or Node. */
(function (root) {
  const L = root.LAYOUTS;

  /* Hotkeys: scene name -> OBS key. Numpad keys need NumLock ON. */
  const HOTKEYS = (() => {
    const h = {
      "Grid": { key: "OBS_KEY_NUM0" },
      "Hosts": { key: "OBS_KEY_NUMPERIOD" },
      "Spotlight · Host 1": { key: "OBS_KEY_NUMSLASH" },
      "Spotlight · Host 2": { key: "OBS_KEY_NUMASTERISK" },
      "Roster": { key: "OBS_KEY_NUMMINUS" },
      "Be Right Back": { key: "OBS_KEY_NUMPLUS", control: true },
      "Starting Soon": { key: "OBS_KEY_NUM0", control: true },
      "Ending": { key: "OBS_KEY_NUMPERIOD", control: true },
    };
    for (let i = 1; i <= 8; i++) {
      h["Spotlight · P" + i] = { key: "OBS_KEY_NUM" + i };
      h["Interview · P" + i] = { key: "OBS_KEY_NUM" + i, control: true };
    }
    // Alt + numpad: teams on the top row (7 = Team A, 8 = Versus, 9 = Team B), duels on 1-4
    for (const def of L.SCENES) {
      if (def.view === "team") h[def.scene] = { key: def.arg === "a" ? "OBS_KEY_NUM7" : "OBS_KEY_NUM9", alt: true };
      if (def.view === "versus") h[def.scene] = { key: "OBS_KEY_NUM8", alt: true };
      if (def.view === "duel") h[def.scene] = { key: "OBS_KEY_NUM" + (def.arg + 1), alt: true };
    }
    return h;
  })();

  /* TAKE (Studio Mode: push Preview to Program) = the "Cut" quick transition */
  const TAKE_KEY = { key: "OBS_KEY_NUMPLUS" };

  /* 405th stingers (stingers/*.webm). point = Transition Point in ms (the frame where the screen is fully covered). */
  const STINGERS = [
    { key: "stinger-hex",    name: "405th Hex Sweep", file: "405th-hex.webm",    point: 620 },
    { key: "stinger-blade",  name: "405th Blade",     file: "405th-blade.webm",  point: 380 },
    { key: "stinger-versus", name: "405th Versus",    file: "405th-versus.webm", point: 620 },
  ];

  const pretty = k => (k.control ? "Ctrl + " : "") + (k.alt ? "Alt + " : "") + "Numpad " + ({
    OBS_KEY_NUMPERIOD: ".", OBS_KEY_NUMSLASH: "/", OBS_KEY_NUMASTERISK: "*",
    OBS_KEY_NUMMINUS: "−", OBS_KEY_NUMPLUS: "+" }[k.key] || k.key.replace("OBS_KEY_NUM", ""));

  let n = 0;
  const uuid = () => {
    if (root.crypto && root.crypto.randomUUID) return root.crypto.randomUUID();
    n++; return "405th000-0000-4000-8000-" + String(n).padStart(12, "0");
  };

  function source(id, name, settings, extra = {}) {
    return Object.assign({
      prev_ver: 503447555, name, uuid: uuid(), id, versioned_id: id, settings,
      mixers: 0, sync: 0, flags: 0, volume: 1.0, balance: 0.5, enabled: true, muted: false,
      "push-to-mute": false, "push-to-mute-delay": 0, "push-to-talk": false, "push-to-talk-delay": 0,
      hotkeys: {}, deinterlace_mode: 0, deinterlace_field_order: 0, monitoring_type: 0,
      private_settings: {}, filters: []
    }, extra);
  }

  /* place: { rect } = fit inside rect (cameras/screens) | { x, y, scale } = position + scale (nameplates) | null = full canvas */
  function item(src, id, place, hidden) {
    const it = {
      name: src.name, source_uuid: src.uuid, visible: !hidden, locked: false, rot: 0.0,
      scale_ref: { x: 1920.0, y: 1080.0 },
      align: 5, bounds_type: 0, bounds_align: 0, bounds_crop: false, bounds: { x: 0.0, y: 0.0 },
      pos: { x: 0.0, y: 0.0 }, scale: { x: 1.0, y: 1.0 },
      crop_left: 0, crop_top: 0, crop_right: 0, crop_bottom: 0,
      id, group_item_backup: false, scale_filter: "disable", blend_method: "default", blend_type: "normal",
      show_transition: { duration: 0 }, hide_transition: { duration: 0 }, private_settings: {}
    };
    if (place && place.rect) {
      const r = place.rect;
      it.pos = { x: r.x, y: r.y };
      it.bounds_type = 2;             // scale to inner bounds
      it.bounds = { x: r.w, y: r.h };
      it.bounds_crop = true;
    } else if (place) {
      it.pos = { x: place.x, y: place.y };
      it.scale = { x: place.scale, y: place.scale };
    }
    return it;
  }

  /* entries: [source, place, hidden] bottom -> top */
  function scene(name, entries) {
    const items = entries.map(([src, place, hidden], i) => item(src, i + 1, place, hidden));
    const s = source("scene", name, { id_counter: items.length, custom_size: false, items }, { mixers: 0 });
    const hk = HOTKEYS[name];
    s.hotkeys = { "OBSBasic.SelectScene": hk ? [Object.assign({}, hk.control ? { control: true } : {}, hk.alt ? { alt: true } : {}, { key: hk.key })] : [] };
    return s;
  }

  /* opts: { root, transition: "move" | "fade" | "cut", audioAll: true } */
  function build(opts) {
    const rootDir = String(opts.root || "").replace(/\\/g, "/").replace(/\/+$/, "");
    const file = rel => rootDir + "/" + rel;
    const browser = (name, rel, extra = {}) => source("browser_source", name, Object.assign({
      is_local_file: true, local_file: file(rel), width: 1920, height: 1080,
      fps_custom: false, reroute_audio: false, restart_when_active: false, shutdown: false,
      webpage_control_level: 2, css: ""
    }, extra));
    const sources = [];

    /* ---- shared sources: one per camera, one per nameplate, one per layout shape ---- */
    const CAM = {}, NAME = {}, FR = {};
    for (const s of L.SEATS) {
      // each camera is its own source -> own mixer channel + volume
      CAM[s] = browser("CAM · " + L.seatName(s), "presets/cam-" + s + ".html", { reroute_audio: true });
      NAME[s] = browser("NAME · " + L.seatName(s), "presets/name-" + s + ".html", { width: L.PLATE.w, height: L.PLATE.h });
      sources.push(CAM[s], NAME[s]);
    }
    for (const id of Object.keys(L.FRAMES)) { FR[id] = browser("FRAMES · " + id, "presets/frames-" + id + ".html"); sources.push(FR[id]); }
    const link = browser("405th LINK", "link.html", { width: 16, height: 16 });
    sources.push(link);

    /* every camera always "on" so everyone stays audible, whatever is on screen */
    const allSeats = scene(L.SEATS_GRID.scene, L.SEATS.map(s => [CAM[s], { rect: L.seatCell(s) }]));
    const OFF = { x: -4000, y: -4000, scale: 0.1 };   // placed off-canvas: active but never seen

    const base = () => [ ...(opts.audioAll !== false ? [[allSeats, OFF]] : []) ];
    const tail = () => [[link, { x: -100, y: -100, scale: 1 }]];

    const layoutScenes = L.SCENES.map(def => {
      if (def.multi) {
        const v = L.view("multi", ["p1", "p2"]);
        const e = base();
        for (const s of L.SEATS) e.push([CAM[s], { rect: v.rects[s] || L.GRID[s] }, !v.rects[s]]);
        e.push([FR.multi2, null], [FR.multi3, null, true], [FR.multi4, null, true]);
        for (const s of L.SEATS) e.push([NAME[s], L.plateXform(v.rects[s] || L.GRID[s], false), !v.rects[s]]);
        return scene(def.scene, e.concat(tail()));
      }
      const v = L.view(def.view, def.arg);
      const seats = L.SEATS.filter(s => v.rects[s]);
      const e = base();
      for (const s of seats) e.push([CAM[s], { rect: v.rects[s] }]);
      e.push([FR[L.framesFor(def)], null]);
      for (const s of seats) e.push([NAME[s], L.plateXform(v.rects[s], !!v.full)]);
      return scene(def.scene, e.concat(tail()));
    });

    const starting = browser("Starting Soon screen", "presets/starting-soon-10min.html", { restart_when_active: true });
    const brb = browser("BRB screen", "presets/brb-5min.html", { restart_when_active: true });
    const ending = browser("Ending screen", "presets/ending.html", { restart_when_active: true });
    const roster = browser("Roster board", "presets/roster.html");
    sources.push(starting, brb, ending, roster);
    const extraScenes = [
      scene("Roster", [...base(), [roster, null], ...tail()]),
      scene("Starting Soon", [[starting, null], ...tail()]),
      scene("Be Right Back", [[brb, null], ...tail()]),
      scene("Ending", [[ending, null], ...tail()]),
    ];

    // Scene order = what OBS's Multiview shows (it shows the first 24 scenes).
    // First 24: Grid, Hosts, Team A, Versus, Team B, 4 Duels, 10 Spotlights, Multi-View A/B, Roster, Starting Soon, BRB.
    // After that: Ending, the 8 Interviews (hotkeys/dock still reach them), then the audio holder.
    const byName = Object.fromEntries([...layoutScenes, ...extraScenes].map(x => [x.name, x]));
    const pick = names => names.map(n => byName[n]).filter(Boolean);
    const defs = L.SCENES;
    const nm = f => defs.filter(f).map(d => d.scene);
    const order = [
      ...pick(["Grid", "Hosts"]),
      ...pick([...nm(d => d.view === "team" && d.arg === "a"), ...nm(d => d.view === "versus"), ...nm(d => d.view === "team" && d.arg === "b")]),
      ...pick(nm(d => d.view === "duel")),
      ...pick(nm(d => d.view === "spotlight")),
      ...pick(nm(d => d.multi)),
      ...pick(["Roster", "Starting Soon", "Be Right Back", "Ending"]),
      ...pick(nm(d => d.view === "interview")),
    ];
    const allScenes = [...order, ...[...layoutScenes, ...extraScenes].filter(x => !order.includes(x)), allSeats];
    sources.push(...allScenes);

    /* transitions: Move (plugin) slides the shared cameras between layouts; Fade / Cut are built in;
       the three 405th stingers are always added so they show up in OBS's transition list */
    const tr = opts.transition || "fade";
    const transitions = [];
    if (tr === "move") transitions.push({ name: "Move", id: "move_transition", settings: {} });
    for (const st of STINGERS) transitions.push({ name: st.name, id: "obs_stinger_transition", settings: {
      path: file("stingers/" + st.file), tp_type: 0, transition_point: st.point,
      audio_monitoring: 0, audio_fade_style: 0, track_matte_enabled: false, hw_decode: true } });
    const stingerPick = STINGERS.find(st => st.key === tr);
    const current = tr === "move" ? "Move" : tr === "cut" ? "Cut" : stingerPick ? stingerPick.name : "Fade";
    const curDur = stingerPick ? 300 : tr === "cut" ? 300 : 600;
    /* optional: the Versus stinger always plays when switching TO a team / versus / duel scene */
    if (opts.versusOverride) for (const sc of layoutScenes) {
      const def = L.sceneToView(sc.name);
      if (def && (def.view === "team" || def.view === "versus" || def.view === "duel"))
        sc.private_settings = Object.assign({}, sc.private_settings, { transition: "405th Versus", transition_duration: 300 });
    }

    return {
      current_scene: "Grid",
      current_program_scene: "Grid",
      scene_order: allScenes.map(s => ({ name: s.name })),
      name: opts.name || "405th Stream Pack",
      sources,
      groups: [],
      // Quick transitions: in Studio Mode their hotkeys push Preview -> Program. TAKE uses your chosen transition.
      quick_transitions: [
        { name: current, duration: curDur, hotkeys: [TAKE_KEY], id: 1, fade_to_black: false },
        { name: "Cut", duration: 300, hotkeys: [], id: 2, fade_to_black: false },
        { name: "Fade", duration: 300, hotkeys: [], id: 3, fade_to_black: true }
      ],
      transitions,
      saved_projectors: [],
      current_transition: current,
      transition_duration: curDur,
      preview_locked: false,
      scaling_enabled: false,
      scaling_level: 0,
      scaling_off_x: 0.0,
      scaling_off_y: 0.0,
      modules: {}
    };
  }

  root.OBSCollection = { build, HOTKEYS, pretty, TAKE_KEY, STINGERS };
  if (typeof module !== "undefined") module.exports = root.OBSCollection;
})(typeof window !== "undefined" ? window : globalThis);
