/* Shared show state (scoreboard, bracket, Q&A card…) stored INSIDE OBS, in the settings of the
   invisible "405th LINK" source. So it survives refreshes/restarts and every Director sees the same thing.
     Overlays:  OBSState.watch("score405", state => …)      read + follow changes
     Director:  OBSState.write(request, "score405", state)   save (uses the Director's own connection)
   Overlays connect with the WebSocket settings from config.local.js. */
(function () {
  const HOLDER = "405th LINK";
  const C = window.PACK_CONFIG || {};

  function parse(v) { try { return typeof v === "string" ? JSON.parse(v) : v || null; } catch (e) { return null; } }

  /* overlay side: own small connection, poll + events */
  /* watch(key, cb, { poll: ms })  — also refreshes instantly when a dock writes (it broadcasts "405th-statechange") */
  function watch(key, onState, opts) {
    const every = (opts && opts.poll) || 1000;
    const o = C.obs || {};
    let ws, alt = false, up = false, rid = 0, last = "__none__";
    const cbs = {};
    const req = (type, data, cb) => { if (!up) return; const id = "o" + (++rid); if (cb) cbs[id] = cb; ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } })); };
    const pull = () => req("GetInputSettings", { inputName: HOLDER }, r => {
      if (!r.requestStatus.result) return;
      const raw = (r.responseData.inputSettings || {})[key];
      const str = raw == null ? "" : String(raw);
      if (str !== last) { last = str; onState(parse(raw)); }
    });
    const open = () => {
      let host = String(o.address || "localhost:4455").trim().replace(/^(wss?|https?):\/\//i, "").replace(/\/+$/, "");
      if (alt) host = host.replace(/^localhost/i, "127.0.0.1");
      alt = !alt;
      try { ws = new WebSocket("ws://" + host); } catch (e) { return setTimeout(open, 4000); }
      ws.onmessage = ev => {
        const m = JSON.parse(ev.data);
        if (m.op === 0) {
          const d = { rpcVersion: 1, eventSubscriptions: 1 | 8 };   // General (dock broadcasts) + Inputs (InputSettingsChanged on newer OBS)
          if (m.d.authentication) d.authentication = sha256b64(sha256b64((o.password || "") + m.d.authentication.salt) + m.d.authentication.challenge);
          ws.send(JSON.stringify({ op: 1, d }));
        } else if (m.op === 2) { up = true; pull(); }
        else if (m.op === 7 && cbs[m.d.requestId]) { const cb = cbs[m.d.requestId]; delete cbs[m.d.requestId]; cb(m.d); }
        else if (m.op === 5 && m.d.eventType === "InputSettingsChanged" && m.d.eventData && m.d.eventData.inputName === HOLDER) pull();
        else if (m.op === 5 && m.d.eventType === "CustomEvent" && m.d.eventData && m.d.eventData.type === "405th-statechange"
                 && (!m.d.eventData.key || m.d.eventData.key === key)) pull();
      };
      ws.onclose = () => { up = false; setTimeout(open, 4000); };
    };
    open();
    setInterval(pull, every);         // backup: older OBS versions don't send InputSettingsChanged
    // test / preview without OBS:  ?state={"a":1,...}
    const q = new URLSearchParams(location.search).get("state");
    if (q) onState(parse(q));
  }

  /* Director side: write with the Director's request(type, data, cb) */
  function write(request, key, state, cb) {
    request("SetInputSettings", { inputName: HOLDER, inputSettings: { [key]: JSON.stringify(state) }, overlay: true }, r => {
      request("BroadcastCustomEvent", { eventData: { type: "405th-statechange", key } });   // overlays + other docks refresh now
      if (cb) cb(r);
    });
  }
  function read(request, key, cb) {
    request("GetInputSettings", { inputName: HOLDER }, r => cb(r.requestStatus.result ? parse((r.responseData.inputSettings || {})[key]) : null));
  }

  window.OBSState = { watch, write, read, HOLDER };
})();
