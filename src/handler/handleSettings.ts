import { ipcMain } from 'electron';
import { getSettings, setSettings, type Settings } from '../settings';

ipcMain.handle('get-settings', async () => getSettings());
ipcMain.handle('set-settings', async (event, settings: Partial<Settings>) => setSettings(settings));
