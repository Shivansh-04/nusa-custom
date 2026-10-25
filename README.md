# Custom Notch — Electron starter

A small Nusa-inspired Windows desktop notch starter. It is an independent implementation and does not include Nusa's original application source code or branding assets.

## Included

- Compact top-center notch with expandable/collapsible panel
- Pomodoro focus/break timer managed by the Electron main process
- Global shortcut: `Ctrl+Shift+Space` (configurable in `main.js`)
- Settings saved to Electron's per-user `userData/settings.json`
- Start with Windows and always-on-top settings
- Restricted preload API with `contextIsolation: true`, `nodeIntegration: false`, and sandboxing
- Windows GitHub Actions workflow that builds a portable `.exe`

## Run locally (Windows)

Install Node.js 22 LTS or newer, then in this folder run:

```powershell
npm install
npm start
```

## Build locally

```powershell
npm run dist
```

The portable executable is written to `dist/`.

## Build using GitHub Actions (recommended for a low-storage PC)

1. Create a new GitHub repository and upload/commit these files to the `main` branch.
2. Open **Actions** in the repository.
3. Select **Build Windows executable** and click **Run workflow**; or push a code change to `main`.
4. Open the completed workflow run and download the `custom-notch-windows` artifact. Extract it to get the `.exe`.

GitHub Actions artifacts are temporary (configured for 14 days). For release distribution, create a GitHub Release and attach the executable.

## Security notes

- Renderer code does not receive Node.js APIs or raw `ipcRenderer`.
- The preload bridge exposes only specific operations.
- The HTML has a restrictive Content Security Policy and no remote connections.
- Review all dependencies and source before distributing the executable. Unsigned Windows binaries may trigger SmartScreen warnings; do not tell users to bypass warnings unless they have independently verified the build.

## Current limitations

- This is a starter prototype, not a feature-complete Nusa replacement.
- The notch is placed at the top-center of the primary display. Multi-monitor placement and DPI behavior need additional testing.
- The timer state is held in memory; settings persist, but a running session does not survive quitting the app.
- A simple original tray icon is included at `assets/custom-notch.png`; replace it with your own branding if desired.
- No music/media integration is included.
- The app does not yet auto-hide for full-screen apps or handle every Windows focus edge case.

## First improvements to make

1. Add a custom app/tray icon under `assets/` and configure it in `main.js` and `package.json`.
2. Add tests for settings validation and timer transitions.
3. Persist timer state if you want sessions to survive restarts.
4. Add multi-monitor selection and screen-scale testing.
5. Add Windows notifications and optional chime for completed sessions.
