"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    window: {
        minimize: () => electron_1.ipcRenderer.send('window:minimize'),
        maximize: () => electron_1.ipcRenderer.send('window:maximize'),
        close: () => electron_1.ipcRenderer.send('window:close'),
        isMaximized: () => electron_1.ipcRenderer.invoke('window:isMaximized'),
    },
    // File system
    fs: {
        showOpenDialog: (options) => electron_1.ipcRenderer.invoke('fs:showOpenDialog', options),
        showSaveDialog: (options) => electron_1.ipcRenderer.invoke('fs:showSaveDialog', options),
        readFile: (filePath) => electron_1.ipcRenderer.invoke('fs:readFile', filePath),
        writeFile: (filePath, data) => electron_1.ipcRenderer.invoke('fs:writeFile', filePath, data),
    },
    // Shell
    shell: {
        openExternal: (url) => electron_1.ipcRenderer.invoke('shell:openExternal', url),
    },
    // App info
    app: {
        getVersion: () => electron_1.ipcRenderer.invoke('app:getVersion'),
        getPath: (name) => electron_1.ipcRenderer.invoke('app:getPath', name),
    },
});
