import { promises as fs } from 'fs';

export interface Settings {
    sessionGapMinutes: number;
    dataDir: string;
    port: number;
    onboardingCompleted: boolean;
    theme: 'light' | 'dark' | 'system';
}

let settings: Settings = {
    sessionGapMinutes: 60,
    dataDir: './conan-chats',
    port: 30128,
    onboardingCompleted: false,
    theme: 'system',
};

export async function loadSettings() {
    try {
        const config = await fs.readFile(
            'conan-chat-logger-config.json',
            'utf8',
        );
        settings = JSON.parse(config) as Settings;
    } catch (error) {
        saveSettings();
    }
}

async function saveSettings() {
    if (settings.onboardingCompleted) {
        await fs.mkdir(settings.dataDir, { recursive: true });
    }
    await fs.writeFile(
        'conan-chat-logger-config.json',
        JSON.stringify(settings, undefined, 2),
        'utf8',
    );
}

export function getSettings() {
    return settings;
}

function assertValidSettings(s: Settings): void {
    if (
        typeof s.sessionGapMinutes !== 'number' ||
        !Number.isFinite(s.sessionGapMinutes) ||
        s.sessionGapMinutes <= 0
    ) {
        console.error('sessionGapMinutes must be a positive number');
    }
    if (typeof s.dataDir !== 'string' || s.dataDir.trim() === '') {
        console.error('dataDir must be a non-empty string');
    }
    if (
        typeof s.port !== 'number' ||
        !Number.isInteger(s.port) ||
        s.port < 1 ||
        s.port > 65535
    ) {
        console.error('port must be an integer between 1 and 65535');
    }
    if (typeof s.onboardingCompleted !== 'boolean') {
        console.error('onboardingCompleted must be a boolean');
    }
    if (s.theme !== 'light' && s.theme !== 'dark' && s.theme !== 'system') {
        console.error('theme must be "light", "dark", or "system"');
    }
}

export async function setSettings(newSettings: Partial<Settings>) {
    const merged: Settings = { ...settings, ...newSettings };
    assertValidSettings(merged);
    settings = merged;
    await saveSettings();
}
