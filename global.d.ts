import type { Settings } from './src/settings';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import type { DateSessions } from './src/handler/handleSessions';
import type { SessionData } from './src/handleMessage';

export {};

declare global {
    interface Window {
        api: {
            getSettings: () => Promise<Settings>;
            setSettings: (settings: Partial<Settings>) => Promise<void>;
            showOpenDialog: (
                options: OpenDialogOptions,
            ) => Promise<OpenDialogReturnValue>;
            getSessions: () => Promise<DateSessions[]>;
            getCurrentSessionData: (
                filename: string,
            ) => Promise<SessionData | undefined>;
            setSessionNotes: (filename: string, notes: string) => Promise<void>;
            setSessionTitle: (filename: string, title: string) => Promise<void>;
            getLocale: () => Promise<string>;
            filterSessionsBySearch: (search: string) => Promise<DateSessions[]>;
            deleteSession: (filename: string) => Promise<void>;
            setSessionHidden: (
                filename: string,
                hidden: boolean,
            ) => Promise<void>;
            splitSession: (
                filename: string,
                splitAfter: number,
            ) => Promise<void>;
            joinSessions: (
                filenames: string[],
                saveToFile: boolean,
            ) => Promise<SessionData>;
            saveMessage: (
                filename: string,
                sender: string,
                message: string,
                index: number,
            ) => Promise<void>;
            importConanAuditLogs: (files: string[]) => Promise<void>;
        };
    }
}

declare module '*.png' {
    const value: string;
    export default value;
}
