import { getSettings, setSettings } from './settings';
import { promises as fs } from 'fs';
import path from 'node:path';

export type ChatEntry = {
    timestamp: string;
    sender: string;
    message: string;
};

export type SessionMetadata = {
    notes: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

export type SessionData = {
    session: SessionMetadata;
    entries: ChatEntry[];
};

export const SESSION_FILE_PATTERN = /^\d{8}(?:\(\d+\))?-\w+(?:-\w+)*\.json$/;

export async function saveMessage(
    sender: string | undefined,
    message: string | undefined,
): Promise<void> {
    if (
        sender === undefined ||
        sender.length === 0 ||
        message === undefined ||
        message.length === 0
    ) {
        throw new Error('Sender and message are required');
    }

    const timestamp = new Date();
    const activeSession = getSettings().activeSession;
    let lastSessionPath: string | null = null;
    let lastSessionData: SessionData | null = null;

    if (activeSession !== '') {
        try {
            lastSessionPath = path.join(getSettings().dataDir, activeSession);

            if (lastSessionPath) {
                const existingContent = await fs.readFile(
                    lastSessionPath,
                    'utf8',
                );
                lastSessionData = JSON.parse(existingContent) as SessionData;
                if (
                    timestamp.getTime() -
                        new Date(
                            JSON.parse(existingContent).session.updatedAt,
                        ).getTime() >
                    getSettings().sessionGapMinutes * 60 * 1000
                ) {
                    lastSessionPath = null;
                    lastSessionData = null;
                }
            }
        } catch (error) {
            lastSessionPath = null;
            lastSessionData = null;
        }
    }

    const safeSender = sender.replace(/\W/g, '');
    const files = await fs.readdir(getSettings().dataDir);

    const date =
        timestamp.getFullYear() +
        String(timestamp.getMonth() + 1).padStart(2, '0') +
        String(timestamp.getDate()).padStart(2, '0');
    const entry: ChatEntry = {
        timestamp: timestamp.toISOString(),
        sender,
        message,
    };

    let newSessionPath: string | null = null;

    if (lastSessionPath === null || lastSessionData === null) {
        newSessionPath = createSessionPath(files, [safeSender], date);
        const initialSession: SessionData = {
            session: {
                notes: '',
                title: timestamp.toLocaleDateString(),
                createdAt: timestamp.toISOString(),
                updatedAt: timestamp.toISOString(),
            },
            entries: [entry],
        };
        await fs.writeFile(
            newSessionPath,
            JSON.stringify(initialSession, undefined, 2),
            'utf8',
        );
    } else {
        lastSessionData.entries.push(entry);
        lastSessionData.session.updatedAt = timestamp.toISOString();

        const senders = activeSession
            .replace(/\.json$/i, '')
            .split('-')
            .slice(1);
        newSessionPath = lastSessionPath;
        if (!senders.includes(safeSender)) {
            senders.push(safeSender);
            newSessionPath = createSessionPath(files, senders, date);
            await fs.rename(lastSessionPath, newSessionPath);
        }
        await fs.writeFile(
            newSessionPath,
            JSON.stringify(lastSessionData, undefined, 2),
            'utf8',
        );
    }
    setSettings({ activeSession: path.basename(newSessionPath ?? '') });
}

export function createSessionPath(
    files: string[],
    senders: string[],
    date: string,
): string {
    let counter = 1;
    let sessionName = `${date}-${senders.join('-')}.json`;
    while (files.includes(sessionName)) {
        sessionName = `${date}(${counter})-${senders.join('-')}.json`;
        counter++;
    }
    return path.join(getSettings().dataDir, sessionName);
}
