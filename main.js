const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

let win;
let tray;
let expanded = false;
let isQuitting = false;
let timerInterval;
let timerState = { running: false, mode: 'focus', remainingSeconds: 25 * 60, endsAt: null };

const DEFAULT_SETTINGS = {
  focusMinutes: 25,
  breakMinutes: 5,
  launchAtLogin: false,
  alwaysOnTop: true,
  shortcut: 'CommandOrControl+Shift+Space'
};
let settings = { ...DEFAULT_SETTINGS };

const settingsPath = () => path.join(app.getPath('userData'), 'settings.json');
function loadSettings() {
  try {
    const parsed = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
    settings = {
      ...DEFAULT_SETTINGS,
      focusMinutes: clampInteger(parsed.focusMinutes, 1, 180, DEFAULT_SETTINGS.focusMinutes),
      breakMinutes: clampInteger(parsed.breakMinutes, 1, 60, DEFAULT_SETTINGS.breakMinutes),
      launchAtLogin: Boolean(parsed.launchAtLogin),
      alwaysOnTop: parsed.alwaysOnTop !== false,
      shortcut: DEFAULT_SETTINGS.shortcut
    };
  } catch {
    settings = { ...DEFAULT_SETTINGS };
  }
}
function saveSettings(next) {
  settings = {
    ...settings,
    focusMinutes: clampInteger(next.focusMinutes, 1, 180, settings.focusMinutes),
    breakMinutes: clampInteger(next.breakMinutes, 1, 60, settings.breakMinutes),
    launchAtLogin: Boolean(next.launchAtLogin),
    alwaysOnTop: Boolean(next.alwaysOnTop),
    shortcut: DEFAULT_SETTINGS.shortcut
  };
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2), 'utf8');
  app.setLoginItemSettings({ openAtLogin: settings.launchAtLogin });
  if (win && !win.isDestroyed()) win.setAlwaysOnTop(settings.alwaysOnTop);
  return { ...settings };
}
function clampInteger(value, min, max, fallback) {
  const n = Number(value);
  return Number.isInteger(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function getWindowBounds(height) {
  const display = screen.getPrimaryDisplay();
  const area = display.workArea;
  const width = Math.min(520, area.width - 24);
  return { x: Math.round(area.x + (area.width - width) / 2), y: display.bounds.y, width, height };
}
function resizeWindow(shouldExpand) {
  if (!win || win.isDestroyed()) return;
  expanded = Boolean(shouldExpand);
  const bounds = getWindowBounds(expanded ? 350 : 52);
  win.setBounds(bounds, true);
  win.webContents.send('ui:expanded-changed', expanded);
}
function createWindow() {
  win = new BrowserWindow({
    ...getWindowBounds(52),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { win = null; });
}
function toggleNotch() {
  if (!win || win.isDestroyed()) return;
  resizeWindow(!expanded);
  if (expanded) win.show();
}
function registerShortcuts() {
  globalShortcut.unregisterAll();
  globalShortcut.register(settings.shortcut, toggleNotch);
}
function broadcastTimer() {
  if (win && !win.isDestroyed()) win.webContents.send('timer:state', { ...timerState });
}
function stopTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}
function startTimerLoop() {
  stopTimerLoop();
  timerInterval = setInterval(() => {
    if (!timerState.running || !timerState.endsAt) return;
    timerState.remainingSeconds = Math.max(0, Math.ceil((timerState.endsAt - Date.now()) / 1000));
    if (timerState.remainingSeconds <= 0) {
      timerState.running = false;
      timerState.endsAt = null;
      timerState.mode = timerState.mode === 'focus' ? 'break' : 'focus';
      timerState.remainingSeconds = (timerState.mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60;
      if (win && !win.isDestroyed()) {
        win.webContents.send('timer:finished', { mode: timerState.mode });
        resizeWindow(true);
      }
    }
    broadcastTimer();
  }, 250);
}
function createTray() {
  const trayImage = nativeImage.createFromPath(path.join(__dirname, 'assets', 'custom-notch.png'));
  tray = new Tray(trayImage);
  tray.setToolTip('Custom Notch');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Toggle notch (Ctrl+Shift+Space)', click: toggleNotch },
    { label: 'Open settings', click: () => { resizeWindow(true); if (win) win.webContents.send('ui:open-settings'); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  ]));
  tray.on('click', toggleNotch);
}

app.whenReady().then(() => {
  loadSettings();
  createWindow();
  createTray();
  registerShortcuts();
  startTimerLoop();
  app.on('activate', () => { if (!win) createWindow(); else { win.show(); resizeWindow(true); } });
});

ipcMain.handle('settings:get', () => ({ ...settings }));
ipcMain.handle('settings:save', (_event, next) => {
  if (!next || typeof next !== 'object') throw new TypeError('Settings must be an object');
  const saved = saveSettings(next);
  registerShortcuts();
  return saved;
});
ipcMain.handle('ui:set-expanded', (_event, value) => {
  resizeWindow(Boolean(value));
  return expanded;
});
ipcMain.handle('timer:command', (_event, command) => {
  if (command === 'start') {
    if (!timerState.running) {
      timerState.running = true;
      timerState.endsAt = Date.now() + timerState.remainingSeconds * 1000;
    }
  } else if (command === 'pause') {
    if (timerState.running && timerState.endsAt) {
      timerState.remainingSeconds = Math.max(0, Math.ceil((timerState.endsAt - Date.now()) / 1000));
      timerState.running = false;
      timerState.endsAt = null;
    }
  } else if (command === 'reset') {
    timerState.running = false;
    timerState.endsAt = null;
    timerState.remainingSeconds = (timerState.mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60;
  } else if (command === 'switch-mode') {
    timerState.running = false;
    timerState.endsAt = null;
    timerState.mode = timerState.mode === 'focus' ? 'break' : 'focus';
    timerState.remainingSeconds = (timerState.mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60;
  } else {
    throw new Error('Unknown timer command');
  }
  broadcastTimer();
  return { ...timerState };
});

app.on('will-quit', () => {
  isQuitting = true;
  stopTimerLoop();
  globalShortcut.unregisterAll();
});
app.on('before-quit', () => { isQuitting = true; });
app.on('window-all-closed', (event) => {
  // The app stays alive in the tray on Windows; quit explicitly from the tray menu.
});
