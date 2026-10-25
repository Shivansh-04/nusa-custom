const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

const W = 560, H = 220;
let win;

function create() {
  const { bounds } = screen.getPrimaryDisplay();
  win = new BrowserWindow({
    width: W, height: H,
    x: Math.round(bounds.x + (bounds.width - W) / 2),
    y: bounds.y,
    frame: false, transparent: true, resizable: false, movable: false,
    skipTaskbar: true, alwaysOnTop: true, hasShadow: false, focusable: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setIgnoreMouseEvents(true, { forward: true }); // click-through when idle
  win.loadFile('ui/index.html');
}

// renderer tells us if the cursor is on the notch
ipcMain.on('mouse', (_e, inside) => {
  if (win) win.setIgnoreMouseEvents(!inside, { forward: true });
});

app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());