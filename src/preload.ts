// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import type { Settings } from './settings';
import type { OpenDialogOptions } from 'electron';
import type { SessionData } from './handleMessage';

contextBridge.exposeInMainWorld('api', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    setSettings: (settings: Partial<Settings>) =>
        ipcRenderer.invoke('set-settings', settings),
    showOpenDialog: (options: OpenDialogOptions) =>
        ipcRenderer.invoke('show-open-dialog', options),
    getSessions: () => ipcRenderer.invoke('get-sessions'),
    getCurrentSessionData: (
        filename: string,
    ): Promise<SessionData | undefined> =>
        ipcRenderer.invoke('get-current-session-data', filename),
    setSessionNotes: (filename: string, notes: string) =>
        ipcRenderer.invoke('set-session-notes', filename, notes),
    setSessionTitle: (filename: string, title: string) =>
        ipcRenderer.invoke('set-session-title', filename, title),
    getLocale: () => ipcRenderer.invoke('get-locale'),
    filterSessionsBySearch: (search: string) =>
        ipcRenderer.invoke('filter-sessions-by-search', search),
    deleteSession: (filename: string) =>
        ipcRenderer.invoke('delete-session', filename),
    setSessionHidden: (filename: string, hidden: boolean) =>
        ipcRenderer.invoke('set-session-hidden', filename, hidden),
    splitSession: (filename: string, splitAfter: number) =>
        ipcRenderer.invoke('split-session', filename, splitAfter),
    joinSessions: (filenames: string[], saveToFile: boolean) =>
        ipcRenderer.invoke('join-sessions', filenames, saveToFile)
});
