import { promises as fs } from 'fs';

export interface Settings {
    sessionGapMinutes: number;
    dataDir: string;
    showChatsFrom: number;
    port: number;
    onboardingCompleted: boolean;
}

let settings: Settings = {
    sessionGapMinutes: 120,
    dataDir: './conan-chats',
    showChatsFrom: 60,
    port: 30128,
    onboardingCompleted: false,
};

export async function loadSettings() {
    try {
        const config = await fs.readFile('conan-chat-logger-config.json', 'utf8');
        settings = JSON.parse(config) as Settings;
    } catch (error) {
        saveSettings();
    }
}

async function saveSettings() {
    await fs.writeFile('conan-chat-logger-config.json', JSON.stringify(settings, undefined, 2), 'utf8');
}

export function getSettings() {
    return settings;
}

export async function setSettings(newSettings: Partial<Settings>) {
    settings = { ...settings, ...newSettings };
    await saveSettings();
}
