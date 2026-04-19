import type { Settings } from './src/settings';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';

export {};

declare global {
    interface Window {
        api: {
            getSettings: () => Promise<Settings>;
            setSettings: (settings: Partial<Settings>) => Promise<void>;
            showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
            getSessions: () => Promise<Session[]>;
            getCurrentSessionData: (filename: string) => Promise<ChatEntry[]>;
        };
    }
}

declare module '*.png' {
    const value: string;
    export default value;
}
