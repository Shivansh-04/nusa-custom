const { spawn } = require('child_process');
const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const script = app.isPackaged
  ? path.join(process.resourcesPath, 'scripts', 'media.ps1')
  : path.join(__dirname, 'scripts', 'media.ps1');
const cmdFile = path.join(app.getPath('temp'), 'nusa-custom-cmd.txt');

let proc = null, buf = '';
const api = { last: { none: true } };

api.start = (cb) => {
  if (process.platform !== 'win32') return;
  proc = spawn('powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-CmdFile', cmdFile],
    { windowsHide: true });
  proc.stdout.setEncoding('utf8');
  proc.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      try { api.last = JSON.parse(line); cb(api.last); } catch {}
    }
  });
  proc.on('exit', () => { proc = null; });
};

api.command = (c) => {
  if (['toggle', 'next', 'prev'].includes(c)) fs.writeFileSync(cmdFile, c);
};
api.stop = () => { if (proc) proc.kill(); };

module.exports = api;