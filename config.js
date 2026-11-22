/* ==========================================================
   405TH STREAM PACK — SETTINGS
   Shared defaults. Put YOUR private settings (camera links, WebSocket
   password, names file location) in config.local.js instead: it overrides
   anything here and is never uploaded to GitHub.
   (Copy config.local.example.js → config.local.js to start.)
   ========================================================== */
window.PACK_CONFIG = {

  // ---------- CAMERAS ----------
  // One link per seat: your switcher's output pages or VDO.Ninja view links.
  // Leave "" for an empty seat (shows "Standby").
  cameras: {
    host1: "", host2: "",
    p1: "", p2: "", p3: "", p4: "", p5: "", p6: "", p7: "", p8: ""
  },

  // Added to VDO.Ninja links only (other links are used exactly as written):
  //   &cleanoutput  hides VDO.Ninja's buttons/menus
  //   &cover        fills the frame edge-to-edge (crops instead of black bars)
  cameraParams: "&cleanoutput&cover",

  // Extra options added to NON-VDO.Ninja links for the Director dock's preview tiles only,
  // e.g. a mute option if your switcher's output page has one. (VDO.Ninja tiles are muted automatically.)
  dockCameraParams: "",

  // ---------- OBS WEBSOCKET (optional but recommended) ----------
  // From OBS → Tools → WebSocket Server Settings → Show Connect Info.
  // Used by the Director dock (so you don't have to type it) and as a
  // backup line between the dock and the overlay for custom multi-views.
  obs: { address: "localhost:4455", password: "" },

  // ---------- NAMES ----------
  // The text file your video switcher writes. Path is relative to
  // this folder, or a full http:// URL if the switcher serves it.
  namesFile: "names.txt",   // see names.example.txt for the format

  // OPTIONAL: if your switcher writes one file PER seat instead,
  // fill this in and it will be used instead of namesFile, e.g.
  // seatFiles: { host1: "host1.txt", p1: "player1.txt", ... },
  seatFiles: null,

  // Length of the layout animation (ms).
  transitionMs: 600,

  // How often to re-read the file (milliseconds).
  pollMs: 500,

  // If the file is just a plain list of names (one per line, or
  // comma separated) they are assigned to seats in this order.
  order: ["host1", "host2", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],

  // Label shown on each seat's tab.
  labels: {
    host1: "Host", host2: "Host",
    p1: "Player 1", p2: "Player 2", p3: "Player 3", p4: "Player 4",
    p5: "Player 5", p6: "Player 6", p7: "Player 7", p8: "Player 8"
  },

  // Teams. Names can also come from the names file ("Team A: Red Dragons").
  teams: {
    a: { name: "Team A", color: "#5ccbe9", seats: ["p1", "p2", "p3", "p4"] },
    b: { name: "Team B", color: "#ff6a4d", seats: ["p5", "p6", "p7", "p8"] }
  },

  // Branding text used on the grid side panel, roster and scene screens.
  eventTitle: "405th Infantry Division",
  eventSubtitle: "Live",
  website: "www.405th.com",
  taglineLeft:  ["Some fans", "play Halo®"],
  taglineRight: ["Some fans", "live it."],

  // Seats the names file doesn't mention show a generic name ("Host 1", "Player 3", "Team A").
  // Set to false to hide those nameplates instead.
  genericNames: true,

  // 1 or 2 hosts to start with. The Director's Hosts switch changes it live during the show.
  hosts: 2,

  // Show type to start with: "tournament", "bookclub", "gamenight", "tutorial" or "hangout".
  // The Director's Show menu changes it live.
  show: "tournament",

  // ---------- EXTRA SCENES ----------
  // Join the 405th
  joinTitle: "Join today",
  joinUrl: "www.405th.com",
  joinSubUrl: "https://405th.com/forums",
  joinQr: "assets/join-qr.png",
  // Sponsors: put logo files in assets/sponsors/ (transparent PNG works best). No logo = name shown in text.
  sponsors: [
    { name: "AVIT", logo: "assets/sponsors/avit.png", tagline: "Stream sponsor" },
    { name: "Strafeline", logo: "assets/sponsors/strafeline.png", tagline: "Stream sponsor" }
  ],
  sponsorSeconds: 8,
  // Discord Call scene: paste your StreamKit voice widget link in config.local.js
  // (streamkit.discord.com/overlay → Install for OBS → Voice Widget → pick server + channel → copy the URL)
  discord: { title: "Discord", subtitle: "Community call", voiceWidget: "" },
  // Chat / Q&A: your Twitch channel name (just the name, e.g. "405thinfantry")
  twitchChannel: "",
  // Extra Life: your DonorDrive team ID or participant ID (from your Extra Life page URL). Leave both blank to type amounts by hand.
  extraLife: { teamId: "", participantId: "", goal: 10000, raised: 0, title: "405th for Extra Life" },

  // Names used only when an overlay is opened with ?demo in the URL.
  demoNames: {
    host1: "Host 1", host2: "Host 2",
    p1: "Player 1", p2: "Player 2", p3: "Player 3", p4: "Player 4",
    p5: "Player 5", p6: "Player 6", p7: "Player 7", p8: "Player 8",
    teama: "Team A", teamb: "Team B"
  }
};

/* config.local.js calls this to override the settings above (objects are merged). */
window.packLocal = function (mine) {
  const C = window.PACK_CONFIG;
  for (const k in mine) {
    const a = C[k], b = mine[k];
    C[k] = (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(b)) ? Object.assign({}, a, b) : b;
  }
};

/* schedule.js calls this with the show rundown. */
window.packSchedule = function (sched) { window.PACK_SCHEDULE = sched; };
