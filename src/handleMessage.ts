import config from './config.json';
import { promises as fs } from 'fs';
import path from 'node:path';

type ChatEntry = {
    timestamp: string;
    sender: string;
    message: string;
};

export async function saveMessage(sender: string | undefined, message: string | undefined): Promise<void> {
    if (sender === undefined || sender.length === 0 || message === undefined || message.length === 0) {
        throw new Error('Sender and message are required');
    }

    const safeSender = sender.replace(/\W/g, '');
    const files = await fs.readdir(config.dataDir);

    const latestSession = (
        await Promise.all(
            files.map(async (name) => {
                const fullPath = path.join(config.dataDir, name);
                const stat = await fs.stat(fullPath);
                return { name, path: fullPath, time: stat.mtimeMs };
            }),
        )
    ).sort((a, b) => b.time - a.time)[0] ?? null;

    const timestamp = new Date();
    const date = timestamp.getFullYear() + String(timestamp.getMonth() + 1).padStart(2, '0') + String(timestamp.getDate()).padStart(2, '0');
    const entry: ChatEntry = {
        timestamp: timestamp.toLocaleString(),
        sender,
        message,
    };

    if (latestSession === null || timestamp.getTime() - latestSession.time > config.sessionGapMinutes * 60 * 1000) {
        const newSessionPath = createSessionPath(files, [safeSender], date);
        await fs.writeFile(newSessionPath, JSON.stringify([entry], null, 2), 'utf8');
        return;
    } else {
        const existingContent = await fs.readFile(latestSession.path, 'utf8');
        const parsed = JSON.parse(existingContent) as ChatEntry[];
        parsed.push(entry);

        const senders = latestSession.name.replace(/\.json$/, '').split('-').slice(1);
        let sessionPath = latestSession.path;
        if (!senders.includes(safeSender)) {
            senders.push(safeSender);
            sessionPath = createSessionPath(files, senders, date);
            await fs.rename(latestSession.path, sessionPath);
        }

        await fs.writeFile(sessionPath, JSON.stringify(parsed, null, 2), 'utf8');
    }
}

function createSessionPath(files: string[], senders: string[], date: string): string {
    let counter = 1;
    let sessionName = `${date}-${senders.join('-')}.json`;
    while (files.includes(sessionName)) {
        sessionName = `${date}(${counter})-${senders.join('-')}.json`;
        counter++;
    }
    return path.join(config.dataDir, sessionName);
}
