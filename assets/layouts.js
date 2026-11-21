/* ==========================================================
   LAYOUTS — shared by stage.html (overlay), setup.html
   (OBS scene builder) and control.html (director dock),
   so camera positions always match.
   All numbers are pixels on a 1920 x 1080 canvas.
   ========================================================== */
(function () {
  const SEATS = ["host1","host2","p1","p2","p3","p4","p5","p6","p7","p8"];
  const W = 1920, H = 1080;
  const CFG = (typeof window !== "undefined" && window.PACK_CONFIG) || {};
  const TEAMS = CFG.teams || {
    a: { name: "Team A", color: "#5ccbe9", seats: ["p1","p2","p3","p4"] },
    b: { name: "Team B", color: "#ff6a4d", seats: ["p5","p6","p7","p8"] },
  };
  const teamOf = seat => (TEAMS.a.seats.includes(seat) ? "a" : TEAMS.b.seats.includes(seat) ? "b" : null);

  const GRID = {
    host1: { x: 32,   y: 32,  w: 697, h: 392 },
    host2: { x: 745,  y: 32,  w: 697, h: 392 },
    p1:    { x: 32,   y: 440, w: 452, h: 254 },
    p2:    { x: 500,  y: 440, w: 452, h: 254 },
    p3:    { x: 968,  y: 440, w: 452, h: 254 },
    p4:    { x: 1436, y: 440, w: 452, h: 254 },
    p5:    { x: 32,   y: 710, w: 452, h: 254 },
    p6:    { x: 500,  y: 710, w: 452, h: 254 },
    p7:    { x: 968,  y: 710, w: 452, h: 254 },
    p8:    { x: 1436, y: 710, w: 452, h: 254 },
  };

  /* standard N-up slot positions (above the 96px bottom bar) */
  const UP = {
    1: [{ x: 0, y: 0, w: W, h: H }],
    2: [{ x: 32, y: 196, w: 916, h: 515 }, { x: 972, y: 196, w: 916, h: 515 }],
    3: [{ x: 141, y: 28, w: 811, h: 456 }, { x: 968, y: 28, w: 811, h: 456 }, { x: 554, y: 500, w: 811, h: 456 }],
    4: [{ x: 141, y: 28, w: 811, h: 456 }, { x: 968, y: 28, w: 811, h: 456 },
        { x: 141, y: 500, w: 811, h: 456 }, { x: 968, y: 500, w: 811, h: 456 }],
  };
  const SIDE = { x: 1458, y: 32, w: 430, h: 392 };

  /* versus: Team A 2x2 on the left, Team B 2x2 on the right */
  const VS_SLOTS = {
    a: [{ x: 32, y: 300, w: 420, h: 236 }, { x: 468, y: 300, w: 420, h: 236 },
        { x: 32, y: 552, w: 420, h: 236 }, { x: 468, y: 552, w: 420, h: 236 }],
    b: [{ x: 1032, y: 300, w: 420, h: 236 }, { x: 1468, y: 300, w: 420, h: 236 },
        { x: 1032, y: 552, w: 420, h: 236 }, { x: 1468, y: 552, w: 420, h: 236 }],
  };

  const place = (seats, slots) => Object.fromEntries(seats.map((s, i) => [s, slots[i]]).filter(([, r]) => r));

  /* view(name, arg) -> { rects, bar, side, title, full, team, headers[], vs, tint } */
  function view(name, arg) {
    switch (name) {
      case "hosts":
        return { rects: place(["host1","host2"], UP[2]), bar: true, title: "Your hosts" };
      case "spotlight":
        return { rects: { [arg]: UP[1][0] }, full: true };
      case "interview":
        return { rects: { [arg]: { x: 32, y: 138, w: 1260, h: 709 },
                          host1: { x: 1316, y: 138, w: 572, h: 322 },
                          host2: { x: 1316, y: 525, w: 572, h: 322 } }, bar: true, label: "On the mic" };
      case "team": {
        const t = TEAMS[arg];
        return { rects: place(t.seats, UP[4]), bar: true, team: arg, tint: true, label: t.name };
      }
      case "versus":
        return { rects: { ...place(TEAMS.a.seats, VS_SLOTS.a), ...place(TEAMS.b.seats, VS_SLOTS.b) },
                 bar: true, tint: true, label: "Head to head",
                 headers: [{ team: "a", x: 32, w: 856, y: 210 }, { team: "b", x: 1032, w: 856, y: 210 }],
                 vs: { x: 960, y: 544 } };
      case "duel": {                       // arg = index 0..3 -> A[i] vs B[i]
        const a = TEAMS.a.seats[arg], b = TEAMS.b.seats[arg];
        return { rects: place([a, b], UP[2]), bar: true, tint: true, label: "Duel",
                 headers: [{ team: "a", x: 32, w: 916, y: 112 }, { team: "b", x: 972, w: 916, y: 112 }],
                 vs: { x: 960, y: 453 } };
      }
      case "multi": {                      // arg = array of seats (1-4), from the director dock
        const seats = (arg && arg.length ? arg : ["p1","p2"]).slice(0, 4);
        if (seats.length === 1) return view("spotlight", seats[0]);
        return { rects: place(seats, UP[seats.length]), bar: true, tint: true, label: "" };
      }
      default:
        return { rects: { ...GRID }, bar: true, side: true, label: "Tonight's squad" };
    }
  }

  /* ---- OBS scene names. The overlay reads the live scene name to pick its view.
          Rename here if you like, BEFORE generating the scene collection. ---- */
  const seatName = s => s.startsWith("host") ? "Host " + s.slice(4) : "P" + s.slice(1);
  const P = SEATS.filter(s => s[0] === "p");
  const SCENES = [
    { scene: "Grid",  view: "grid" },
    { scene: "Hosts", view: "hosts" },
    { scene: "Team A", view: "team", arg: "a" },
    { scene: "Team B", view: "team", arg: "b" },
    { scene: "Teams · Versus", view: "versus" },
    ...[0,1,2,3].map(i => ({ scene: `Duel · ${seatName(TEAMS.a.seats[i])} v ${seatName(TEAMS.b.seats[i])}`, view: "duel", arg: i })),
    ...SEATS.map(s => ({ scene: "Spotlight · " + seatName(s), view: "spotlight", arg: s })),
    ...P.map(s => ({ scene: "Interview · " + seatName(s), view: "interview", arg: s })),
    { scene: "Multi-View A", view: "multi", arg: null, multi: true },
    { scene: "Multi-View B", view: "multi", arg: null, multi: true },
  ];
  /* Multi-View scenes carry their seats in the name, e.g. "Multi-View A · Host 2, P7, P8".
     The Director dock renames the scene; the overlay reads the name. Nothing else to sync. */
  const SEP = " · ";
  const fromSeatName = t => SEATS.find(s => seatName(s).toLowerCase() === t.trim().toLowerCase());
  const multiName = (base, seats) => base + SEP + seats.map(seatName).join(", ");
  function sceneToView(name) {
    name = String(name || "");
    const exact = SCENES.find(x => x.scene === name);
    if (exact) return exact;
    const m = SCENES.find(x => x.multi && name.startsWith(x.scene + SEP));
    if (!m) return null;
    const seats = name.slice(m.scene.length + SEP.length).split(",").map(fromSeatName).filter(Boolean).slice(0, 4);
    return Object.assign({}, m, { seats });
  }
  const multiBase = name => { const v = sceneToView(name); return v && v.multi ? v.scene : null; };

  const api = { W, H, SEATS, GRID, UP, SIDE, TEAMS, teamOf, view, SCENES, sceneToView, seatName, multiName, multiBase };
  if (typeof window !== "undefined") window.LAYOUTS = api;
  else globalThis.LAYOUTS = api;
})();
