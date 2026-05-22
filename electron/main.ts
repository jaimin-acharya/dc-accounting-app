import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fork, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let serverProcess: ChildProcess | null = null;

const NEXT_PORT = 3000;

function createWindow(): void {
  mainWindow = new BrowserWindow({
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

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${NEXT_PORT}`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Ensure the database is copied to a writeable location
    const userDataPath = app.getPath('userData');
    const dbDir = path.join(userDataPath, 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'dev.db');

    if (!fs.existsSync(dbPath)) {
      // Find the source DB in the app package
      const srcDbPath = path.join(app.getAppPath(), 'prisma/dev.db');
      if (fs.existsSync(srcDbPath)) {
        try {
          fs.copyFileSync(srcDbPath, dbPath);
          console.log('Database initialized successfully at:', dbPath);
        } catch (err) {
          console.error('Failed to copy database on startup:', err);
        }
      } else {
        console.warn('Source database not found at:', srcDbPath);
      }
    }

    // Start Next.js standalone server programmatically in production
    const serverPath = path.join(app.getAppPath(), '.next/standalone/server.js');

    // Fork the standalone server.js with correct cwd and environment variables
    serverProcess = fork(serverPath, [], {
      cwd: app.getAppPath(),
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
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.close());
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false);
}

function createTray(): void {
  // Use a simple tray icon
  const trayIcon = nativeImage.createEmpty();
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
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
        app.quit();
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
ipcMain.handle('fs:showOpenDialog', async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('fs:showSaveDialog', async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  return fs.readFileSync(filePath);
});

ipcMain.handle('fs:writeFile', async (_, filePath: string, data: string) => {
  fs.writeFileSync(filePath, data);
  return true;
});

ipcMain.handle('shell:openExternal', async (_, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('app:getPath', (_, name: string) => app.getPath(name as any));

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
