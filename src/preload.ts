// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import type { Settings } from './settings';
import type { OpenDialogOptions } from 'electron';

contextBridge.exposeInMainWorld('api', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    setSettings: (settings: Partial<Settings>) => ipcRenderer.invoke('set-settings', settings),
    showOpenDialog: (options: OpenDialogOptions) => ipcRenderer.invoke('show-open-dialog', options),
});
