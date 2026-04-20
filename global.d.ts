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
            showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
            getSessions: () => Promise<DateSessions[]>;
            getCurrentSessionData: (filename: string) => Promise<SessionData | undefined>;
            setSessionNotes: (filename: string, notes: string) => Promise<void>;
            setSessionTitle: (filename: string, title: string) => Promise<void>;
            getLocale: () => Promise<string>;
        };
    }
}

declare module '*.png' {
    const value: string;
    export default value;
}
