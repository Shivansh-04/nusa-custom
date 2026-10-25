const { contextBridge, ipcRenderer } = require('electron');

// Expose only specific, validated operations to the renderer. Never expose ipcRenderer itself.
contextBridge.exposeInMainWorld('desktop', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  setExpanded: (expanded) => ipcRenderer.invoke('ui:set-expanded', Boolean(expanded)),
  timerCommand: (command) => {
    const allowed = ['start', 'pause', 'reset', 'switch-mode'];
    if (!allowed.includes(command)) throw new Error('Invalid timer command');
    return ipcRenderer.invoke('timer:command', command);
  },
  onExpandedChanged: (callback) => {
    const listener = (_event, expanded) => callback(Boolean(expanded));
    ipcRenderer.on('ui:expanded-changed', listener);
    return () => ipcRenderer.removeListener('ui:expanded-changed', listener);
  },
  onOpenSettings: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('ui:open-settings', listener);
    return () => ipcRenderer.removeListener('ui:open-settings', listener);
  },
  onTimerState: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('timer:state', listener);
    return () => ipcRenderer.removeListener('timer:state', listener);
  },
  onTimerFinished: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('timer:finished', listener);
    return () => ipcRenderer.removeListener('timer:finished', listener);
  }
});
