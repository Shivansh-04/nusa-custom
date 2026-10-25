const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('nusa', {
  size: (open) => ipcRenderer.send('size', open),
  focusable: (v) => ipcRenderer.send('focusable', v),
  media: {
    get: () => ipcRenderer.invoke('media:get'),
    on: (cb) => ipcRenderer.on('media', (_e, s) => cb(s)),
    cmd: (c) => ipcRenderer.send('media:cmd', c)
  },
  file: {
    pathFor: (f) => webUtils.getPathForFile(f),
    info: (p) => ipcRenderer.invoke('file:info', p),
    drag: (p) => ipcRenderer.send('file:drag', p),
    open: (p) => ipcRenderer.send('file:open', p)
  }
});