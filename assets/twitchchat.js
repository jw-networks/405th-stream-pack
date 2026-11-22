/* Read-only Twitch chat (anonymous; no login or keys needed).
   TwitchChat("channelname", msg => …)   msg = { id, user, color, text, badges, mod, sub, ts } */
window.TwitchChat = function (channel, onMessage, onStatus) {
  channel = String(channel || "").trim().replace(/^#/, "").toLowerCase();
  if (!channel) { onStatus && onStatus("no channel"); return null; }
  let ws, stopped = false;
  const tagMap = s => Object.fromEntries(s.split(";").map(kv => { const i = kv.indexOf("="); return [kv.slice(0, i), kv.slice(i + 1)]; }));
  function open() {
    ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    ws.onopen = () => {
      ws.send("CAP REQ :twitch.tv/tags");
      ws.send("PASS SCHMOOPIIE");
      ws.send("NICK justinfan" + Math.floor(10000 + Math.random() * 80000));
      ws.send("JOIN #" + channel);
      onStatus && onStatus("connected");
    };
    ws.onmessage = ev => {
      for (const line of String(ev.data).split("\r\n")) {
        if (!line) continue;
        if (line.startsWith("PING")) { ws.send("PONG :tmi.twitch.tv"); continue; }
        const m = line.match(/^@([^ ]+) :([^!]+)![^ ]+ PRIVMSG #[^ ]+ :(.*)$/);
        if (!m) continue;
        const t = tagMap(m[1]);
        const badges = (t.badges || "").split(",").filter(Boolean).map(b => b.split("/")[0]);
        onMessage({
          id: t.id || String(Date.now() + Math.random()),
          user: t["display-name"] || m[2], color: t.color || "#5ccbe9",
          text: m[3].replace(/^\u0001ACTION (.*)\u0001$/, "$1"),
          badges, mod: badges.includes("moderator") || badges.includes("broadcaster"), sub: badges.includes("subscriber"),
          ts: Date.now()
        });
      }
    };
    ws.onclose = () => { onStatus && onStatus("reconnecting"); if (!stopped) setTimeout(open, 3000); };
  }
  open();
  return { stop() { stopped = true; try { ws.close(); } catch (e) {} } };
};
