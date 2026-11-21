# 405th Stream Pack — OBS Setup

Overlays, camera layouts, hotkeys and a director panel for a 2-host / 8-player show
(Team A = Players 1–4, Team B = Players 5–8).

- **Cameras** come from **VDO.Ninja** links and are drawn *inside* the overlay, so they always move
  with their frames and nameplates. There's nothing to line up in OBS.
- **Names** come live from your video switcher's text file.

```
405th-stream-pack/
├── config.js        ← shared defaults: team names/colors, event text, labels
├── config.local.js  ← YOUR private settings: camera links, WebSocket password, names file (never uploaded)
├── setup.html       ← builds your OBS scenes + hotkeys (open in Chrome/Edge)
├── control.html     ← Director dock: click-to-switch, custom 2/3/4-up, auto cycle
├── names.txt        ← sample names file (your switcher can overwrite this)
├── stage.html       ← the overlay: all 10 cameras + frames + nameplates, follows the live OBS scene
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
Double-click **`setup.html`**. Check the folder path at the top (it fills itself in), then click
**Download scene collection**. You get `405th-scenes.json`, usually in Downloads.

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
All camera audio comes through one mixer channel called **STAGE OVERLAY**. Set its level in the Audio Mixer.
To mute one person, add `&noaudio` to the end of their link in `config.js`. To mute everyone, add `&noaudio` to `cameraParams`.

### 8. Turn on Preview → TAKE (Studio Mode)
In the Director dock, tick **Preview first**. This turns on OBS Studio Mode. Now:
- Dock buttons and scene hotkeys **load the shot into Preview**. Nothing changes on stream.
- **TAKE** pushes Preview to live: the dock's red TAKE button, **`Numpad +`** anywhere, or **Space/Enter** while the dock is focused.
- The **Auto director** still switches **live** directly. Pressing TAKE stops it, so you can take over.

Untick **Preview first** to go back to buttons and hotkeys cutting straight to live.

> **If `Numpad +` doesn't take:** OBS → Settings → Hotkeys → search **"Transition"** → set **Transition** (or *Quick Transition: Cut*) to `Numpad +`.

> **Watch the dock's PREVIEW monitor, not OBS's Preview pane.** All scenes share one overlay, so OBS's own
> Preview pane always shows the live layout. The dock's green PREVIEW monitor shows the queued layout with names,
> and the red PROGRAM monitor shows what's live.

### The camera multiview (in the dock)
Under the Preview/Program monitors is a live tile for every seat:
- **Click a tile** to spotlight that seat. It goes to Preview when *Preview first* is on, otherwise straight to live.
- **Tally borders:** **red** means the seat is on screen live; **green** means it's in the shot waiting in Preview.
- The **Program** monitor shows a real picture of the live output grabbed from OBS (a few frames per second).
  Untick *Real picture in Program monitor* to go back to the layout sketch.
- Untick **Live camera previews** to stop the tiles if the streaming PC is working hard. Each tile is a second
  connection to that camera.

> **Audio check (important):** the dock is a web page, so if a camera page plays sound, the dock plays it through
> your PC speakers too, and *Desktop Audio* would pick it up. VDO.Ninja tiles are muted automatically. For your
> switcher's output pages, check once: open the dock, and if you hear a player's voice from the speakers, either set
> `dockCameraParams` in `config.js` to the switcher's mute option (ask AVIT), or untick *Live camera previews*.

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
Every layout scene contains the same single `STAGE OVERLAY` source, which holds all 10 cameras. When you
change scenes, the overlay reads the new scene name and animates every camera, frame and nameplate into
place. The cameras stay connected the whole time, so switching is instant. Scenes switch with a **Cut**,
which is seamless because it's the same source, and the overlay does the animation.
**If you rename scenes, rename them in `assets/layouts.js` first, then re-run setup.**

### Custom 2-up / 3-up / 4-up
In the dock under **Custom 2 / 3 / 4-up**, tap up to 4 seats in the order you want them, then click **Show**.
2 seats sit side by side, 3 seats are two on top and one below, and 4 seats are 2×2. 1 seat goes to that seat's Spotlight.
With **Preview first** on, the custom view loads into Preview; press TAKE to put it live.

The dock **renames** the Multi-View scene to list its seats, e.g. `Multi-View A · Host 2, P7, P8`. That's how the overlay
knows what to show, so don't rename those two scenes by hand. The dock alternates between A and B so it never
changes the scene that's on air.

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

**What the remote Director gets automatically:** once connected, the overlay running in OBS sends it the current
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
- **Changed a link during the show?** Save `config.js`, then right-click STAGE OVERLAY → **Refresh**.
- All 10 feeds run in one browser source. On a weaker PC, add `&bitrate=2500` or similar to the player links.

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
- **Studio Mode:** the overlay follows the *Program* scene, so OBS's own Preview pane shows the live layout. Use the dock's PREVIEW monitor to see what's queued.
- **Testing in a browser:** open `stage.html?demo` for sample names, plus `&view=team&team=a`, `&view=versus`, `&view=duel&n=2`,
  `&view=multi&seats=p1,p5,host1`, `&view=spotlight&seat=p3`, and so on.
