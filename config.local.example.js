// EXAMPLE — copy this file to config.local.js, then fill it in. config.local.js stays on your PC (it is listed in .gitignore).
// Anything here overrides config.js.
packLocal({
  cameras: {
    host1: "",
    host2: "",
    p1: "https://example.com/your-camera-link-1",
    p2: "https://example.com/your-camera-link-2",
    p3: "https://example.com/your-camera-link-3",
    p4: "https://example.com/your-camera-link-4",
    p5: "https://example.com/your-camera-link-5",
    p6: "https://example.com/your-camera-link-6",
    p7: "https://example.com/your-camera-link-7",
    p8: "https://example.com/your-camera-link-8"
  },

  // OBS → Tools → WebSocket Server Settings → Show Connect Info
  obs: { address: "localhost:4455", password: "" },

  // Where your switcher writes names (relative to this folder, a /C:/... path, or a URL)
  namesFile: "names.txt"
});
