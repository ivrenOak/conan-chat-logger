import { ipcMain, dialog, type OpenDialogOptions } from 'electron';
import { getSettings, setSettings, type Settings } from '../settings';

ipcMain.handle('get-settings', async () => getSettings());
ipcMain.handle('set-settings', async (event, settings: Partial<Settings>) =>
    setSettings(settings),
);
ipcMain.handle('show-open-dialog', async (event, options: OpenDialogOptions) =>
    dialog.showOpenDialog(options),
);
ipcMain.handle('get-locale', async () => navigator.language);
