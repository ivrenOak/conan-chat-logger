import { app, BrowserWindow, Tray, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { getSettings, loadSettings } from './settings';
import { startServer } from './server';
import './handler/handleSettings';
import './handler/handleSessions';
import { checkAndInstallUpdate } from './checkUpdate';

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: MAIN_WINDOW_VITE_DEV_SERVER_URL
            ? path.join(__dirname, '../../app/public/logo.png')
            : path.join(
                  __dirname,
                  `../renderer/${MAIN_WINDOW_VITE_NAME}/logo.png`,
              ),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(
                __dirname,
                `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
            ),
        );
    }

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
    mainWindow.removeMenu();
    mainWindow.on('close', () => {
        mainWindow.close();
    });
}

/** Focus existing UI or open one (duplicate .exe shortcut, tray open, etc.). */
function focusOrCreateMainWindow(): void {
    const wins = BrowserWindow.getAllWindows();
    if (wins.length === 0) {
        createWindow();
        return;
    }
    const w = wins[0];
    if (w.isMinimized()) {
        w.restore();
    }
    w.show();
    w.focus();
}

function handleQuit(): void {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

// Installing / updating via Squirrel — exit immediately.
if (started) {
    app.quit();
} else if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    let tray: Tray | null = null;

    loadSettings();

    app.on('second-instance', focusOrCreateMainWindow);

    app.whenReady().then(() => {
        createWindow();

        tray = new Tray(
            MAIN_WINDOW_VITE_DEV_SERVER_URL
                ? path.join(__dirname, '../../app/public/logo.png')
                : path.join(
                      __dirname,
                      `../renderer/${MAIN_WINDOW_VITE_NAME}/logo.png`,
                  ),
        );
        tray.setToolTip('Conan Chat Logger');

        tray.setContextMenu(
            Menu.buildFromTemplate([
                { label: 'Quit', type: 'normal', click: handleQuit },
            ]),
        );
        tray.addListener('click', () => focusOrCreateMainWindow());

        checkAndInstallUpdate();
    });

    app.on('window-all-closed', () => {
        if (!getSettings().closeToSystemTray) {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    startServer();
}
