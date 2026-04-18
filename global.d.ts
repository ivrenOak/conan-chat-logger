import type { Settings } from './src/settings';

export {};

declare global {
    interface Window {
        api: {
            getSettings: () => Promise<Settings>;
        };
    }
}
