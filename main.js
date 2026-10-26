const { app, BrowserWindow, screen, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const media = require('./media');

if (!app.requestSingleInstanceLock()) app.quit();

const SIZES = { boot: { w: 360, h: 170 }, closed: { w: 270, h: 52 }, open: { w: 480, h: 172 } };
let win, state = 'boot';
// let win, state = 'closed';
const icons = new Map();

function place(s) {
  if (!win) return;
  state = s;
  const { w, h } = SIZES[s];
  const b = screen.getPrimaryDisplay().bounds;
  win.setBounds({ x: Math.round(b.x + (b.width - w) / 2), y: b.y, width: w, height: h });
}

function create() {
  const { w, h } = SIZES.boot;
  win = new BrowserWindow({
    width: w, height: h, show: false,
    frame: false, transparent: true, resizable: false, movable: false,
    skipTaskbar: true, alwaysOnTop: true, hasShadow: false, focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      autoplayPolicy: 'no-user-gesture-required'
    }
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  place('boot');
  win.loadFile('ui/index.html');
  win.once('ready-to-show', () => win.showInactive());
  media.start((s) => win.webContents.send('media', s));
}

ipcMain.on('size', (_e, s) => place(SIZES[s] ? s : 'closed'));
ipcMain.on('focusable', (_e, v) => {
  if (!win) return;
  win.setFocusable(v);
  if (v) win.focus();
});
ipcMain.on('media:cmd', (_e, c) => media.command(c));
ipcMain.handle('media:get', () => media.last);

ipcMain.handle('file:info', async (_e, p) => {
  try {
    if (typeof p !== 'string') return null;
    const st = fs.statSync(p);
    const icon = await app.getFileIcon(p, { size: 'normal' });
    icons.set(p, icon);
    return { path: p, name: path.basename(p), size: st.size, dir: st.isDirectory(), icon: icon.toDataURL() };
  } catch { return null; }
});
ipcMain.on('file:drag', (e, p) => {
  const icon = icons.get(p);
  if (icon) e.sender.startDrag({ file: p, icon });
});
ipcMain.on('file:open', (_e, p) => { if (typeof p === 'string') shell.openPath(p); });

app.whenReady().then(() => {
  create();
  screen.on('display-metrics-changed', () => place(state));
});
app.on('before-quit', () => media.stop());
app.on('window-all-closed', () => app.quit());