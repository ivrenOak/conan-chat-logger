import { ipcMain } from 'electron';
import { getSettings } from '../settings';
import { promises as fs } from 'fs';
import path from 'path';
import type { ChatEntry } from '../handleMessage';

export type DateSessions = {
    date: string;
    sessions: {
        senders: string[];
        filename: string;
    }[];
};

ipcMain.handle('get-sessions', async () => {
    const files = await fs.readdir(getSettings().dataDir);
    const sessionsByDate: DateSessions[] = [];
    const sessionFilePattern = /^\d{8}(?:\(\d+\))?-.+\.json$/;

    for (const filename of files) {
        if (!sessionFilePattern.test(filename)) {
            continue;
        }

        const dateToken = filename.split('-')[0];
        const date = dateToken.replace(/\(\d+\)$/, '');
        const senders = filename.split('-').slice(1).map((sender) => sender.replace(/\.json$/, ''));
        if (senders.length === 0 || senders.some((sender) => sender.length === 0)) {
            continue;
        }

        let dateSession = sessionsByDate.find((entry) => entry.date === date);
        if (!dateSession) {
            dateSession = { date, sessions: [] };
            sessionsByDate.push(dateSession);
        }
        dateSession.sessions.push({ senders, filename });
    }

    sessionsByDate.map((entry) => {
        entry.date = parseYYYYMMDD(entry.date);
    });

    return sessionsByDate;
});

ipcMain.handle('get-current-session-data', async (event, filename: string) => {
    const files = await fs.readdir(getSettings().dataDir);

    const currentSessionFile = files.find((file) => file === filename);
    if (!currentSessionFile) {
        console.error('Session file not found');
        return undefined;
    }
    const data = await fs.readFile(path.join(getSettings().dataDir, currentSessionFile), 'utf8');
    return JSON.parse(data) as ChatEntry[];
});

function parseYYYYMMDD(dateStr: string): string {
    if (!/^\d{8}$/.test(dateStr)) {
        throw new Error('Invalid format. Expected YYYYMMDD');
    }

    const year = Number(dateStr.slice(0, 4));
    const month = Number(dateStr.slice(4, 6)) - 1;
    const day = Number(dateStr.slice(6, 8));

    return new Date(year, month, day).toLocaleDateString();
}
