/* Reads the switcher's names file and tells overlays when names change.
   Accepted file formats (auto-detected):
     1) Labeled lines     Host 1: Ben      | P3=Tahu | Player 2 - Jeff
     2) Plain list        one name per line (or comma separated), in PACK_CONFIG.order
     3) JSON              {"host1":"Ben","p1":"Amanda"}
   Seat keys understood: host/host1/h1, host2/h2, player1/p1/seat1 ... player8/p8
*/
(function () {
  const CFG = window.PACK_CONFIG || {};
  const ORDER = CFG.order || ["host1","host2","p1","p2","p3","p4","p5","p6","p7","p8"];
  const SEATS = new Set([...ORDER, "teama", "teamb"]);
  const params = new URLSearchParams(location.search);
  const DEMO = params.has("demo");

  function seatKey(raw) {
    const k = String(raw).toLowerCase().replace(/[^a-z0-9]/g, "");
    let m;
    if ((m = k.match(/^(host|h|cohost)(\d*)$/))) return "host" + (m[1] === "cohost" ? "2" : (m[2] || "1"));
    if ((m = k.match(/^(player|plr|p|seat|s|guest|g|slot|cam)(\d+)$/))) return "p" + Number(m[2]);
    if ((m = k.match(/^team(a|b|1|2)(name)?$/))) return "team" + ({ 1: "a", 2: "b" }[m[1]] || m[1]);
    return k;
  }

  function genericName(seat) {
    let m;
    if ((m = /^host(\d)$/.exec(seat))) return "Host " + m[1];
    if ((m = /^p(\d)$/.exec(seat))) return "Player " + m[1];
    // team names fall back to config.js → teams (default "Team A" / "Team B")
    return "";
  }

  function parse(text) {
    text = String(text || "").replace(/^﻿/, "").trim();
    const out = {};
    if (!text) return out;

    if (text[0] === "{") {
      try {
        const j = JSON.parse(text);
        for (const k in j) out[seatKey(k)] = String(j[k] ?? "").trim();
        return out;
      } catch (e) { /* fall through */ }
    }

    let lines = text.split(/\r?\n/).map(l => l.trim());
    const kvRe = /^([^:=\-\t]{1,24}?)\s*(?::|=|\t|\s-\s)\s*(.*)$/;
    const isKV = l => { const m = l.match(kvRe); return m && SEATS.has(seatKey(m[1])); };

    if (lines.some(isKV)) {
      for (const l of lines) {
        const m = l.match(kvRe);
        if (m && SEATS.has(seatKey(m[1]))) out[seatKey(m[1])] = m[2].trim();
      }
      return out;
    }

    if (lines.length === 1 && lines[0].includes(",")) lines = lines[0].split(",").map(s => s.trim());
    lines.forEach((name, i) => { if (ORDER[i]) out[ORDER[i]] = name; });
    return out;
  }

  async function read(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    return r.text();
  }

  const listeners = [];
  let current = {};
  let lastRaw = null;

  function emit(next) {
    const prev = current;
    current = next;
    listeners.forEach(fn => fn(current, prev));
  }

  async function poll() {
    try {
      let raw, next;
      if (CFG.seatFiles) {
        const keys = Object.keys(CFG.seatFiles);
        const vals = await Promise.all(keys.map(k => read(CFG.seatFiles[k]).catch(() => "")));
        next = {};
        keys.forEach((k, i) => next[seatKey(k)] = vals[i].replace(/^﻿/, "").trim());
        raw = JSON.stringify(next);
      } else {
        raw = await read(CFG.namesFile || "names.txt");
        next = parse(raw);
      }
      if (raw !== lastRaw) { lastRaw = raw; emit(next); }
    } catch (e) {
      if (lastRaw === null) { lastRaw = ""; emit({}); }   // file missing: show empty seats
    }
  }

  window.Names = {
    config: CFG,
    order: ORDER,
    parse,
    seatKey,
    label(seat) {
      return params.get("label") || (CFG.labels && CFG.labels[seat]) || seat.toUpperCase();
    },
    /* Name for a seat. If the names file doesn't mention the seat (or there is no file yet),
       a generic name is used: "Host 1", "Player 3"... An explicitly blank name ("P3:") stays blank. */
    get(seat) {
      if (Object.prototype.hasOwnProperty.call(current, seat)) return String(current[seat] || "").trim();
      return CFG.genericNames === false ? "" : genericName(seat);
    },
    generic: s => genericName(s),
    /* names pushed in from elsewhere (the overlay in OBS relays them to a remote dock) */
    set(obj) {
      if (!obj || typeof obj !== "object") return;
      const raw = "ext:" + JSON.stringify(obj);
      if (raw === lastRaw) return;
      lastRaw = raw; emit(Object.assign({}, obj));
    },
    /* every seat + team name as currently resolved (for relaying) */
    snapshot() {
      const out = {};
      for (const k of [...ORDER, "teama", "teamb"]) out[k] = this.get(k);
      return out;
    },
    onChange(fn) {
      listeners.push(fn);
      if (lastRaw !== null) fn(current, {});
    },
    start() {
      if (DEMO) { lastRaw = "demo"; emit({ ...(CFG.demoNames || {}) }); return; }
      poll();
      setInterval(poll, Number(params.get("poll")) || CFG.pollMs || 500);
    }
  };

  /* Shrink text until it fits its box (long gamertags). */
  window.fitText = function (el, maxPx, minPx) {
    el.style.fontSize = maxPx + "px";
    let s = maxPx;
    while (s > minPx && el.scrollWidth > el.clientWidth + 1) {
      s -= 1; el.style.fontSize = s + "px";
    }
  };
})();
