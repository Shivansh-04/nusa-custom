const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nusa', {
  mouse: (v) => ipcRenderer.send('mouse', v)
});