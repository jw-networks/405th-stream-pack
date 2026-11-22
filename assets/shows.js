/* ==========================================================
   SHOW TYPES — Tournament, Book Club, Game Night, Tutorial Q&A, Open Panel.
   Picked in the Director (stored in OBS as "show405"), default from config.js → show.
   Decides seat labels ("Player 3" / "Reader 3" …), whether team colours are used,
   the crew title ("Tonight's fireteam" / "Tonight's book club" …) and which
   Director sections come first.
   Overlays: SHOWS.follow() reads + follows the choice from OBS.  ?show=bookclub overrides (testing).
   ========================================================== */
(function () {
  const CFG = (typeof window !== "undefined" && window.PACK_CONFIG) || {};
  const TYPES = {
    tournament: { label: "Tournament",    role: "Player",   crew: "Tonight's fireteam",  teams: true },
    bookclub:   { label: "Book Club",     role: "Reader",   crew: "Tonight's book club" },
    gamenight:  { label: "Game Night",    role: "Squad",    crew: "Tonight's fireteam" },
    tutorial:   { label: "Tutorial Q&A",  role: "Guest",    crew: "Tonight's guests" },
    hangout:    { label: "Open Panel",    role: "Panelist", crew: "Tonight's panel" },
  };
  const P = typeof location !== "undefined" ? new URLSearchParams(location.search) : new URLSearchParams("");
  let cur = TYPES[CFG.show] ? CFG.show : "tournament";
  if (TYPES[P.get("show")]) cur = P.get("show");
  const fns = [];

  function set(t) {
    if (!TYPES[t] || t === cur) return false;
    cur = t;
    fns.forEach(f => { try { f(cur); } catch (e) {} });
    return true;
  }
  function seatLabel(seat) {
    if (/^host/.test(seat)) return (CFG.labels && CFG.labels[seat]) || "Host";
    const m = /^p(\d+)$/.exec(seat);
    if (!m) return seat.toUpperCase();
    if (TYPES[cur].teams) return (CFG.labels && CFG.labels[seat]) || "Player " + m[1];
    return TYPES[cur].role + " " + m[1];
  }

  const api = {
    TYPES,
    get: () => cur,
    def: () => TYPES[cur],
    set,
    onChange: f => fns.push(f),
    teams: () => !!TYPES[cur].teams,
    role: () => TYPES[cur].role,
    crew: () => TYPES[cur].crew,
    seatLabel,
    /* overlays inside OBS: read the show type from OBS and follow changes */
    follow(opts) {
      if (TYPES[P.get("show")]) return;
      if (!(opts && opts.ws === false) && typeof OBSState !== "undefined" && CFG.obs && CFG.obs.address)
        OBSState.watch("show405", st => set(st && TYPES[st.type] ? st.type : (TYPES[CFG.show] ? CFG.show : "tournament")), { poll: 5000 });
      if (typeof window !== "undefined") window.addEventListener("message", e => { const d = e.data || {}; if (d.type === "405th-show") set(d.show); });
    },
  };
  if (typeof window !== "undefined") window.SHOWS = api; else globalThis.SHOWS = api;
})();
