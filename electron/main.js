"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
let mainWindow = null;
let tray = null;
let serverProcess = null;
const NEXT_PORT = 3000;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 680,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#0F0F0F',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
        },
        icon: path.join(__dirname, '../public/assets/icon.png'),
        show: false,
    });
    const isDev = !electron_1.app.isPackaged;
    if (isDev) {
        mainWindow.loadURL(`http://localhost:${NEXT_PORT}`);
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        // Ensure the database is copied to a writeable location
        const userDataPath = electron_1.app.getPath('userData');
        const dbDir = path.join(userDataPath, 'database');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        const dbPath = path.join(dbDir, 'dev.db');
        if (!fs.existsSync(dbPath)) {
            // Find the source DB in the app package
            const srcDbPath = path.join(electron_1.app.getAppPath(), 'prisma/dev.db');
            if (fs.existsSync(srcDbPath)) {
                try {
                    fs.copyFileSync(srcDbPath, dbPath);
                    console.log('Database initialized successfully at:', dbPath);
                }
                catch (err) {
                    console.error('Failed to copy database on startup:', err);
                }
            }
            else {
                console.warn('Source database not found at:', srcDbPath);
            }
        }
        // Start Next.js standalone server programmatically in production
        const serverPath = path.join(electron_1.app.getAppPath(), '.next/standalone/server.js');
        // Fork the standalone server.js with correct cwd and environment variables
        serverProcess = (0, child_process_1.fork)(serverPath, [], {
            cwd: electron_1.app.getAppPath(),
            env: {
                ...process.env,
                PORT: NEXT_PORT.toString(),
                HOSTNAME: 'localhost',
                NODE_ENV: 'production',
                DB_PATH: dbPath,
            },
            silent: false
        });
        // Handle initial server connection failures by retrying
        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            if (validatedURL.startsWith(`http://localhost:${NEXT_PORT}`)) {
                console.log('Server not ready, retrying load in 500ms...');
                setTimeout(() => {
                    mainWindow?.loadURL(`http://localhost:${NEXT_PORT}`);
                }, 500);
            }
        });
        // Wait a brief moment for Next.js standalone server to start, then load the URL
        setTimeout(() => {
            mainWindow?.loadURL(`http://localhost:${NEXT_PORT}`);
        }, 500);
    }
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        mainWindow?.focus();
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Window controls IPC
    electron_1.ipcMain.on('window:minimize', () => mainWindow?.minimize());
    electron_1.ipcMain.on('window:maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        }
        else {
            mainWindow?.maximize();
        }
    });
    electron_1.ipcMain.on('window:close', () => mainWindow?.close());
    electron_1.ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false);
}
function createTray() {
    // Use a simple tray icon
    const trayIcon = electron_1.nativeImage.createEmpty();
    tray = new electron_1.Tray(trayIcon);
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Dhruvanshi Construction ERP',
            enabled: false,
        },
        { type: 'separator' },
        {
            label: 'Show App',
            click: () => {
                mainWindow?.show();
                mainWindow?.focus();
            },
        },
        {
            label: 'Quit',
            click: () => {
                electron_1.app.quit();
            },
        },
    ]);
    tray.setToolTip('Dhruvanshi Construction ERP');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
        mainWindow?.show();
        mainWindow?.focus();
    });
}
// IPC Handlers for file system
electron_1.ipcMain.handle('fs:showOpenDialog', async (_, options) => {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, options);
    return result;
});
electron_1.ipcMain.handle('fs:showSaveDialog', async (_, options) => {
    const result = await electron_1.dialog.showSaveDialog(mainWindow, options);
    return result;
});
electron_1.ipcMain.handle('fs:readFile', async (_, filePath) => {
    return fs.readFileSync(filePath);
});
electron_1.ipcMain.handle('fs:writeFile', async (_, filePath, data) => {
    fs.writeFileSync(filePath, data);
    return true;
});
electron_1.ipcMain.handle('shell:openExternal', async (_, url) => {
    await electron_1.shell.openExternal(url);
});
electron_1.ipcMain.handle('app:getVersion', () => electron_1.app.getVersion());
electron_1.ipcMain.handle('app:getPath', (_, name) => electron_1.app.getPath(name));
electron_1.app.whenReady().then(() => {
    createWindow();
    createTray();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('will-quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});
