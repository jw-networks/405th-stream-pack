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

  function item(src, id, rect) {
    const it = {
      name: src.name, source_uuid: src.uuid, visible: true, locked: false, rot: 0.0,
      scale_ref: { x: 1920.0, y: 1080.0 },
      align: 5, bounds_type: 0, bounds_align: 0, bounds_crop: false, bounds: { x: 0.0, y: 0.0 },
      pos: { x: 0.0, y: 0.0 }, scale: { x: 1.0, y: 1.0 },
      crop_left: 0, crop_top: 0, crop_right: 0, crop_bottom: 0,
      id, group_item_backup: false, scale_filter: "disable", blend_method: "default", blend_type: "normal",
      show_transition: { duration: 0 }, hide_transition: { duration: 0 }, private_settings: {}
    };
    if (rect) {
      it.pos = { x: rect.x, y: rect.y };
      it.bounds_type = 2;             // scale to inner bounds
      it.bounds = { x: rect.w, y: rect.h };
      it.bounds_crop = true;
    }
    return it;
  }

  function scene(name, entries) {
    const items = entries.map(([src, rect, hidden], i) => { const it = item(src, i + 1, rect); if (hidden) it.visible = false; return it; });
    const s = source("scene", name, { id_counter: items.length, custom_size: false, items }, { mixers: 0 });
    const hk = HOTKEYS[name];
    s.hotkeys = { "OBSBasic.SelectScene": hk ? [Object.assign({}, hk.control ? { control: true } : {}, hk.alt ? { alt: true } : {}, { key: hk.key })] : [] };
    return s;
  }

  function build(opts) {
    const rootDir = String(opts.root || "").replace(/\\/g, "/").replace(/\/+$/, "");
    const file = rel => rootDir + "/" + rel;
    const browser = (name, rel, extra = {}) => source("browser_source", name, Object.assign({
      is_local_file: true, local_file: file(rel), width: 1920, height: 1080,
      fps_custom: false, reroute_audio: false, restart_when_active: false, shutdown: false,
      webpage_control_level: 2, css: ""
    }, extra));

    const sources = [];
    // One overlay holds all 10 VDO.Ninja cameras + frames. Audio from the cameras goes to the OBS mixer.
    const stage = browser("STAGE OVERLAY", "stage.html", { reroute_audio: true });
    if (opts.slate) stage.settings.local_file = file("presets/stage-slate.html");
    const starting = browser("Starting Soon screen", "presets/starting-soon-10min.html", { restart_when_active: true });
    const brb = browser("BRB screen", "presets/brb-5min.html", { restart_when_active: true });
    const ending = browser("Ending screen", "presets/ending.html", { restart_when_active: true });
    const roster = browser("Roster board", "presets/roster.html");
    sources.push(stage, starting, brb, ending, roster);

    // Every layout scene is just the overlay; the overlay reads the scene name and animates.
    const layoutScenes = L.SCENES.map(def => scene(def.scene, [[stage, null]]));
    const extraScenes = [
      scene("Roster", [[roster, null]]),
      scene("Starting Soon", [[starting, null]]),
      scene("Be Right Back", [[brb, null]]),
      scene("Ending", [[ending, null]]),
    ];
    const allScenes = [...layoutScenes, ...extraScenes];
    sources.push(...allScenes);

    // Same source in every layout scene + "Cut" = no flash; the overlay does the animation itself.
    const transitions = [];
    const current = "Cut";

    return {
      current_scene: "Grid",
      current_program_scene: "Grid",
      scene_order: allScenes.map(s => ({ name: s.name })),
      name: opts.name || "405th Stream Pack",
      sources,
      groups: [],
      // Quick transitions: in Studio Mode their hotkeys push Preview -> Program. "Cut" gets the TAKE key.
      quick_transitions: [
        { name: "Cut", duration: 300, hotkeys: [TAKE_KEY], id: 1, fade_to_black: false },
        { name: "Fade", duration: 300, hotkeys: [], id: 2, fade_to_black: false },
        { name: "Fade", duration: 300, hotkeys: [], id: 3, fade_to_black: true }
      ],
      transitions,
      saved_projectors: [],
      current_transition: current,
      transition_duration: 300,
      preview_locked: false,
      scaling_enabled: false,
      scaling_level: 0,
      scaling_off_x: 0.0,
      scaling_off_y: 0.0,
      modules: {}
    };
  }

  root.OBSCollection = { build, HOTKEYS, pretty, TAKE_KEY };
  if (typeof module !== "undefined") module.exports = root.OBSCollection;
})(typeof window !== "undefined" ? window : globalThis);
