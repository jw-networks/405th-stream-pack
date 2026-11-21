# 405th Stream Pack — OBS Setup

Overlays, camera layouts, hotkeys and a director panel for a 2-host / 8-player show
(Team A = Players 1–4, Team B = Players 5–8).

- **Native OBS scenes:** every camera is its own OBS source (`CAM · P3`), every nameplate is its own source (`NAME · P3`),
  and every scene is built from them. OBS's **Multiview**, **Preview** and **Studio Mode** all show the real picture
  of each scene, and every person gets their **own volume slider**.
- **Names** come live from your video switcher's text file.

```
405th-stream-pack/
├── config.js        ← shared defaults: team names/colors, event text, labels
├── config.local.js  ← YOUR private settings: camera links, WebSocket password, names file (never uploaded)
├── setup.html       ← builds your OBS scenes + hotkeys (open in Chrome/Edge)
├── control.html     ← Director dock: click-to-switch, custom 2/3/4-up, auto cycle
├── names.txt        ← sample names file (your switcher can overwrite this)
├── cam.html         ← one camera (used by the CAM · … sources)
├── link.html        ← invisible helper that sends names + cameras to remote Directors
├── stage.html       ← frames/background layers (FRAMES · … sources) and the dock's layout sketches
├── roster.html      ← full-screen lineup board
├── scene.html       ← Starting Soon / Be Right Back / Ending screens
├── nameplate.html   ← one seat's nameplate, for use anywhere
├── presets/         ← ready-to-use versions of the above with options filled in
├── previews/        ← pictures of every layout
└── assets/          ← theme, logos, font, scripts, layouts.js (all positions)
```

---

## Importing into OBS — step by step

**You need:** OBS 30 or newer, on the streaming PC. No plugins required.

### 1. Put the folder in its permanent home
Unzip to somewhere it will stay, e.g. `C:\Streams\405th-stream-pack`.
The scene file remembers this location, so if you move the folder later, redo steps 4–5.

### 2. Turn on the OBS WebSocket
OBS → **Tools → WebSocket Server Settings** → tick **Enable WebSocket server** → **Show Connect Info** →
copy the **Server Password**.

### 3. Fill in your private settings
If there's no `config.local.js` in the folder, copy `config.local.example.js` and rename the copy to `config.local.js`.
Open it in Notepad:
- **`cameras`**: one link per seat: your switcher's output pages (`https://switcher.avit.is/output.html?outputId=3`)
  or VDO.Ninja **view** links. Leave a seat as `""` and it shows a "Standby" card.
- **`obs`**: paste the WebSocket password from step 2 between the quotes: `password: "xxxxxxxx"`.
- **`namesFile`**: where your switcher writes names. If it saves `names.txt` into this folder, leave it as is.

Save it. `config.local.js` overrides `config.js` and is listed in `.gitignore`, so it never goes to GitHub.
Shared things like team names and colors and the event text stay in `config.js`. You can also override any of them in `config.local.js`.

### 4. Build the scene file
Double-click **`setup.html`**. Check the folder path at the top (it fills itself in), then:
- Pick the **transition**: **Move** (cameras slide and zoom between layouts; install the free
  [Move Transition plugin](https://obsproject.com/forum/resources/move.913/) first), or **Fade** / **Cut** (built in).
- Leave **Everyone's audio always on** ticked, so people stay audible when they're off screen.
- Click **Download scene collection**. You get `405th-scenes.json`, usually in Downloads.

### 5. Import it into OBS
1. **Settings → Video** → Base (Canvas) Resolution **1920×1080** → OK.
2. Menu **Scene Collection → Import** → **…** under *Collection Path* → choose `405th-scenes.json` → make sure it's ticked → **Import**.
3. Menu **Scene Collection → 405th Stream Pack** to switch to it. Your old scenes are untouched, and you can switch back from the same menu.

You should see all the scenes (Grid, Hosts, Team A …). Click a few. The cameras appear once each
VDO.Ninja guest is live.

### 6. Add the Director dock
**Docks → Custom Browser Docks** → Dock Name `Director`, URL
`file:///C:/Streams/405th-stream-pack/control.html` (your folder, with forward slashes) → **Apply**.
The dock badge should turn green (**Connected**). If it says Offline, click it, paste the password, and click Connect.

### 7. Check the audio
Each camera has its own mixer channel: **CAM · Host 1 … CAM · P8**. Set levels or mute people right in OBS's Audio Mixer.
To mute someone for the whole show, you can also add `&noaudio` to the end of their VDO.Ninja link.

### 8. Turn on Preview → TAKE (Studio Mode)
In the Director dock, tick **Preview first**. This turns on OBS Studio Mode. Now:
- Dock buttons and scene hotkeys **load the shot into Preview**. Nothing changes on stream.
- **TAKE** pushes Preview to live: the dock's red TAKE button, **`Numpad +`** anywhere, or **Space/Enter** while the dock is focused.
- The **Auto director** still switches **live** directly. Pressing TAKE stops it, so you can take over.

Untick **Preview first** to go back to buttons and hotkeys cutting straight to live.

> **If `Numpad +` doesn't take:** OBS → Settings → Hotkeys → search **"Transition"** → set **Transition** (or *Quick Transition: Cut*) to `Numpad +`.

> OBS's own **Preview** pane, **Multiview** and the dock's monitors all show the real picture of the queued scene.

### Pinned monitors (in the dock)
The status bar, Preview/Program monitors and TAKE stay at the top while you scroll. **Drag the small bar under TAKE**
up or down to resize the monitors, or **double-click** it to hide or show them. The dock remembers your size.

### Go live / End stream (in the dock)
The bar at the top of the Director starts and stops your stream (using the stream settings already in OBS).
- **Two clicks to confirm:** the first click arms it (the button turns amber and reads "Click to GO LIVE"), and the second click does it.
  If you don't click again within 4 seconds, it disarms. **End stream** works the same way.
- The status shows **Off air**, **Starting…**, **LIVE** with a running timer (plus % of dropped frames, if any), **Reconnecting…** or **Stopping…**.
- It works from a remote Director too. Anyone with the address and password can start or stop the stream.

### The camera multiview (in the dock)
Under the Preview/Program monitors is a tile for every seat:
- **Click a tile** to spotlight that seat. It goes to Preview when *Preview first* is on, otherwise straight to live.
- **Tally borders:** **red** means the seat is on screen live; **green** means it's in the shot waiting in Preview.
- The **Preview** and **Program** monitors are real pictures from OBS.
- **Camera tiles → live from OBS** (default): the dock grabs **one** small picture of the *SEATS GRID* scene (all 10
  cameras) several times a second and cuts it into the 10 tiles. There are no extra connections to your cameras, no
  audio from the dock, and it works the same for remote operators. Use **Speed** (2–15 fps) and **Quality** to trade
  smoothness for load. 5 fps / medium is light on OBS and fine through a tunnel. Pictures pause while the dock is hidden.
  *direct camera links* loads each camera in the dock instead (full motion, but a second connection per camera).

### 9. Test the hotkeys
With NumLock on: `Numpad 0` Grid, `Alt + Numpad 7` Team A, `Numpad 3` Spotlight P3, then `Numpad +` to take.

---

## All layouts and hotkeys

| Scene | What it shows | Hotkey |
|---|---|---|
| **Grid** | Both hosts + all 8 players | `Numpad 0` |
| **Hosts** | The two hosts side by side (2-up) | `Numpad .` |
| **Team A** | Players 1–4, 2×2, Team A color | `Alt + Numpad 7` |
| **Teams · Versus** | Team A left vs Team B right, team names + VS | `Alt + Numpad 8` |
| **Team B** | Players 5–8, 2×2, Team B color | `Alt + Numpad 9` |
| **Duel · P1 v P5 … P4 v P8** | Head-to-head 2-up | `Alt + Numpad 1 … 4` |
| **Spotlight · Host 1 / Host 2** | That host full screen | `Numpad /` · `Numpad *` |
| **Spotlight · P1 … P8** | That player full screen | `Numpad 1 … 8` |
| **Interview · P1 … P8** | Player large + both hosts (3-up) | `Ctrl + Numpad 1 … 8` |
| **Multi-View A / B** | Any 2, 3 or 4 seats picked in the dock | dock only |
| **Roster** | Lineup board, split by team | `Numpad −` |
| **Be Right Back** | BRB, 5-min countdown | `Ctrl + Numpad +` |
| **Starting Soon** | Starting Soon, 10-min countdown | `Ctrl + Numpad 0` |
| **Ending** | Thanks for watching | `Ctrl + Numpad .` |
| **TAKE** | Push Preview to live (Studio Mode) | `Numpad +` |

With **Preview first** on (Studio Mode), every scene key above loads **Preview**, and `Numpad +` takes it live.
With it off, scene keys cut straight to live.

Change any key in **OBS → Settings → Hotkeys** (search for the scene name). A Stream Deck can switch to these scenes too.

### How it works
- **10 CAM sources** (one per seat), **10 NAME sources** (nameplates) and a **FRAMES** source per layout shape
  (background, frames, team headers, bottom bar). Every scene uses the same CAM and NAME sources, placed for that layout.
- **SEATS GRID (dock · audio · keep)** holds all 10 cameras in a grid and sits hidden off-screen in every scene. It keeps
  all cameras live so everyone stays audible, and the Director takes one small snapshot of it to fill all 10 camera tiles.
  Don't delete it. Untick *Everyone's audio always on* in setup if you'd rather only hear who's on screen.
- **405th LINK** (invisible) sends names and camera links to remote Directors.
- **Transitions:** with **Move**, the same camera slides from its old spot to its new one (for example a player zooming
  from the Grid into a Spotlight). With Fade or Cut, layouts change in place.
- **Renaming scenes:** rename them in `assets/layouts.js` first, then re-run setup. The dock and hotkeys use these names.

### OBS Multiview
**View → Multiview (Windowed)** shows Preview, Program and your scenes. Click a scene to load it into Preview,
and double-click it to take it live. For the most shots, set **Settings → General → Multiview → Layout** to
**"Horizontal, Top (24 Scenes)"**, and tick *Click to switch between scenes*.
Multiview shows the **first 24 scenes in the scene list**: Grid, Hosts, Team A, Versus, Team B, the 4 Duels, all 10 Spotlights,
Multi-View A/B, Roster, Starting Soon and BRB. Ending and the Interviews sit below; reach them with hotkeys or the dock.
To change what's shown, drag scenes up or down in OBS's Scenes list.

### Custom 2-up / 3-up / 4-up
In the dock under **Custom 2 / 3 / 4-up**, tap up to 4 seats in the order you want them, then click **Show**.
2 seats sit side by side, 3 seats are two on top and one below, and 4 seats are 2×2. 1 seat goes to that seat's Spotlight.
With **Preview first** on, the custom view loads into Preview; press TAKE to put it live.

The dock arranges the CAM and NAME sources inside a **Multi-View** scene and renames it to list its seats, e.g.
`Multi-View A · Host 2, P7, P8`, so you can see what's in it in the scene list and Multiview. It alternates between A and B,
so it never changes the scene that's on air. Leave the sources inside those two scenes alone; the dock manages them.

### Auto director
Cycles shots every N seconds **on the live output** (even with Preview first on): player spotlights, host spotlights,
team views and duels, optionally with the Grid between shots, skipping empty seats. You can keep loading
Preview while it runs. Pressing **TAKE** stops it and puts your shot on air. With Preview first off, clicking any button stops it.

---

## Remote control (Director on GitHub Pages)

The Director runs from this repo's GitHub Pages site, so a crew member anywhere can open it in a browser:
`https://<your-github-name>.github.io/<repo>/control.html`

It needs a **secure (`wss://`) address** for your OBS WebSocket. GitHub Pages is https, and browsers won't let an
https page talk to a plain `ws://` address on another computer. Pick one option:

**Option A: Cloudflare quick tunnel (fastest, anyone with the link and password)**
1. On the OBS PC, install cloudflared once: open PowerShell and run `winget install --id Cloudflare.cloudflared`.
2. Before the show, run: `cloudflared tunnel --url http://localhost:4455`
3. It prints an address like `https://quiet-river-1234.trycloudflare.com`. Your remote operators enter it in the Director
   with **`wss://`** in front: `wss://quiet-river-1234.trycloudflare.com`, plus the WebSocket password.
4. Close the window after the show. The address changes every time you start it.

**Option B: Tailscale (private, only people you invite)**
1. Install Tailscale on the OBS PC and on each operator's computer, all in the same tailnet.
2. On the OBS PC: `tailscale serve --bg 4455`
3. Operators use `wss://<obs-pc-name>.<your-tailnet>.ts.net` in the Director.

**Security:** anyone with the address **and** password can control your OBS, including stopping the stream.
Use a long WebSocket password, share it privately, and only run the tunnel during the show.

**What the remote Director gets automatically:** once connected, the **405th LINK** source in OBS sends it the current
names, team names and camera links. Remote operators don't need any files, and the camera links never go into the public repo.
This needs the WebSocket password in the OBS PC's `config.local.js` (step 3).

**Tip:** you can share `.../control.html?host=wss://quiet-river-1234.trycloudflare.com` so the address is filled in.
Send the password separately. The Director remembers both on that browser.

**On the OBS PC itself**, keep using the local dock (`file:///…/control.html`) with `localhost:4455`. No tunnel needed.

## Camera tips
- Links that aren't VDO.Ninja (like your switcher's output pages) are used exactly as written.

## VDO.Ninja tips
- Use each guest's **view** link (`https://vdo.ninja/?view=STREAMID`), the same one you'd put in a normal OBS browser source.
- The pack adds `&cleanoutput&cover` automatically (no VDO.Ninja buttons, video fills the frame). Change this with `cameraParams` in `config.js`.
- Quality and bitrate options work as usual on each link, e.g. `&bitrate=4000`.
- **Changed a link during the show?** Save `config.local.js`, then right-click that seat's **CAM · …** source → **Refresh**.
- Each CAM source renders at 1920×1080. On a weaker PC, lower the CAM sources to 1280×720 in their properties, or add `&bitrate=2500` to VDO.Ninja links.

## Names file
Set `namesFile` in `config.js`:
- **Easiest:** the switcher saves into this folder as `names.txt`.
- **Elsewhere on the same PC:** `"/C:/Switcher/output/names.txt"` (start with a slash).
- **Served over the web:** full URL, e.g. `"http://localhost:3000/names.txt"` (the server must allow cross-origin requests).
- **One file per seat:** use `seatFiles` instead.

The format is detected automatically:
```
Host 1: Spartan Ben          Spartan Ben              {"host1":"Spartan Ben",
Host 2: Commander Kat        Commander Kat             "p1":"Amanda",
Player 1: Amanda             Amanda                    "teamA":"Blue Team"}
P2=Jeff                      Jeff
Team A: Blue Team            ...
Team B: Red Team
```
- **Generic by default:** any seat the file doesn't mention (or no file at all) shows **Host 1, Host 2, Player 1 … Player 8**,
  and teams show **Team A / Team B** (or the names in `config.js` → `teams`). Set `genericNames: false` to hide them instead.
- A name the file **explicitly leaves blank** (`Player 8:`) hides that seat's nameplate, and the auto director can skip that seat.

## Branding & tweaks
- **Colors and fonts:** top of `assets/theme.css`. **Team colors:** `config.js` → `teams`.
- **Logo:** replace `assets/logo.png` and `assets/emblem.png` with your original transparent PNGs, keeping the same names.
- **Move or resize windows:** edit `assets/layouts.js`. The overlay and dock pick it up after a refresh. Only scene *names* need a re-import.
- **Animation length:** `transitionMs` in `config.js`.

## Good to know
- **Upgrading from the earlier single-overlay version:** remove the old scene collection, then re-run setup and import.
  The custom multi-views need the new CAM/NAME sources.
- **Testing in a browser:** open `stage.html?demo` for sample names, plus `&view=team&team=a`, `&view=versus`, `&view=duel&n=2`,
  `&view=multi&seats=p1,p5,host1`, `&view=spotlight&seat=p3`, and so on.
