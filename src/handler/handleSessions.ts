import { ipcMain } from 'electron';
import { getSettings, setSettings } from '../settings';
import { promises as fs } from 'fs';
import path from 'path';
import {
    createSessionPath,
    SESSION_FILE_PATTERN,
    type ChatEntry,
    type SessionData,
} from '../handleMessage';

export type DateSessions = {
    date: Date;
    sessions: {
        senders: string[];
        filename: string;
    }[];
};

const TIME_PREFIX_PATTERN = /^(\d{2}):(\d{2})\s+(.*)$/;
const WITH_SENDER_BEFORE_CHANNEL_PATTERN =
    /^(?<sender>.+?)\s+\[(?<channel>[^\]]+)\]\s*:\s*(?:\[(?<language>[^\]]+)\]\s*)?(?<message>.*)$/;
const WITH_CHANNEL_BEFORE_SENDER_PATTERN =
    /^\[(?<channel>[^\]]+)\]\s*(?:\[(?<language>[^\]]+)\]\s*)?(?<sender>.+?)\s+(?<message>.*)$/;

ipcMain.handle('get-sessions', getSessions);

ipcMain.handle('get-current-session-data', async (event, filename: string) => {
    if (!(await checkSessionFileExists(filename))) {
        console.error('Session file not found');
        return undefined;
    }
    const data = await fs.readFile(
        path.join(getSettings().dataDir, filename),
        'utf8',
    );
    return JSON.parse(data) as SessionData;
});

ipcMain.handle(
    'set-session-notes',
    async (event, filename: string, notes: string) => {
        if (!(await checkSessionFileExists(filename))) {
            console.error('Session file not found');
            return;
        }

        const data = await fs.readFile(
            path.join(getSettings().dataDir, filename),
            'utf8',
        );
        const parsed = JSON.parse(data) as SessionData;
        parsed.session.notes = notes;
        await fs.writeFile(
            path.join(getSettings().dataDir, filename),
            JSON.stringify(parsed, undefined, 2),
            'utf8',
        );
    },
);

ipcMain.handle(
    'set-session-title',
    async (event, filename: string, title: string) => {
        if (!(await checkSessionFileExists(filename))) {
            console.error('Session file not found');
            return;
        }

        const data = await fs.readFile(
            path.join(getSettings().dataDir, filename),
            'utf8',
        );
        const parsed = JSON.parse(data) as SessionData;
        parsed.session.title = title;
        await fs.writeFile(
            path.join(getSettings().dataDir, filename),
            JSON.stringify(parsed, undefined, 2),
            'utf8',
        );
    },
);

ipcMain.handle('filter-sessions-by-search', async (event, search: string) => {
    const sessions = await getSessions();
    const normalizedSearch = search.toLowerCase();

    for (const dateSessions of sessions) {
        const matches = await Promise.all(
            dateSessions.sessions.map(async (session) => {
                const data = await fs.readFile(
                    path.join(getSettings().dataDir, session.filename),
                    'utf8',
                );
                const parsed = JSON.parse(data) as SessionData;
                return parsed.entries.some((entry) =>
                    entry.message.toLowerCase().includes(normalizedSearch),
                );
            }),
        );

        dateSessions.sessions = dateSessions.sessions.filter(
            (_, index) => matches[index],
        );
    }

    return sessions.filter((dateSessions) => dateSessions.sessions.length > 0);
});

ipcMain.handle('delete-session', async (event, filename: string) => {
    if (!(await checkSessionFileExists(filename))) {
        console.error('Session file not found');
        return;
    }
    await fs.unlink(path.join(getSettings().dataDir, filename));
    return;
});

ipcMain.handle(
    'set-session-hidden',
    async (event, filename: string, hidden: boolean) => {
        if (!(await checkSessionFileExists(filename))) {
            console.error('Session file not found');
            return;
        }
        const settings = getSettings();
        if (hidden) {
            settings.hiddenSessions.push(filename);
        } else {
            settings.hiddenSessions = settings.hiddenSessions.filter(
                (f) => f !== filename,
            );
        }
        await setSettings({ hiddenSessions: settings.hiddenSessions });
        return;
    },
);

ipcMain.handle(
    'split-session',
    async (event, filename: string, splitAfter: number) => {
        if (!(await checkSessionFileExists(filename))) {
            console.error('Session file not found');
            return;
        }

        let files = await fs.readdir(getSettings().dataDir);
        const data = await fs.readFile(
            path.join(getSettings().dataDir, filename),
            'utf8',
        );
        const parsed = JSON.parse(data) as SessionData;
        const session1 = {
            ...parsed,
            entries: parsed.entries.slice(0, splitAfter),
        };
        const senders1 = Array.from(
            new Set(
                session1.entries.map((entry) =>
                    entry.sender.replace(/\W/g, ''),
                ),
            ),
        );
        const session2 = {
            ...parsed,
            entries: parsed.entries.slice(splitAfter),
        };
        const senders2 = Array.from(
            new Set(
                session2.entries.map((entry) =>
                    entry.sender.replace(/\W/g, ''),
                ),
            ),
        );
        const date = filename.slice(0, 8);
        const session1Path = createSessionPath(files, senders1, date);
        await fs.writeFile(
            session1Path,
            JSON.stringify(session1, undefined, 2),
            'utf8',
        );
        files = await fs.readdir(getSettings().dataDir);
        const session2Path = createSessionPath(files, senders2, date);
        await fs.writeFile(
            session2Path,
            JSON.stringify(session2, undefined, 2),
            'utf8',
        );
        await fs.unlink(path.join(getSettings().dataDir, filename));
        return;
    },
);

ipcMain.handle(
    'join-sessions',
    async (event, filenames: string[], saveToFile: boolean) => {
        const existingFilenames = await Promise.all(
            filenames.filter(
                async (filename) => await checkSessionFileExists(filename),
            ),
        );

        if (existingFilenames.length === 0) {
            console.error('No valid session files were provided');
            return undefined;
        }

        const sessionsData = await Promise.all(
            existingFilenames.map(async (filename) => {
                const data = await fs.readFile(
                    path.join(getSettings().dataDir, filename),
                    'utf8',
                );
                return JSON.parse(data) as SessionData;
            }),
        );

        const mergedEntries = sessionsData
            .flatMap((sessionData) => sessionData.entries)
            .sort(
                (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime(),
            );

        const firstCreatedAt = sessionsData
            .map((sessionData) => sessionData.session.createdAt)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
        const lastUpdatedAt = sessionsData
            .map((sessionData) => sessionData.session.updatedAt)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

        const mergedTitle = sessionsData
            .map((sessionData) => sessionData.session.title)
            .join(', ');
        const mergedNotes = sessionsData
            .map((sessionData) => sessionData.session.notes)
            .join('\n\n');

        const mergedSession: SessionData = {
            session: {
                title: mergedTitle,
                notes: mergedNotes,
                createdAt: firstCreatedAt,
                updatedAt: lastUpdatedAt,
            },
            entries: mergedEntries,
        };

        if (saveToFile) {
            const files = await fs.readdir(getSettings().dataDir);

            const date =
                new Date(firstCreatedAt).getFullYear() +
                String(new Date(firstCreatedAt).getMonth() + 1).padStart(
                    2,
                    '0',
                ) +
                String(new Date(firstCreatedAt).getDate()).padStart(2, '0');

            const senders = Array.from(
                new Set(
                    mergedEntries.map((entry) =>
                        entry.sender.replace(/\W/g, ''),
                    ),
                ),
            );
            const filepath = await createSessionPath(files, senders, date);
            await fs.writeFile(
                filepath,
                JSON.stringify(mergedSession, undefined, 2),
                'utf8',
            );
            for (const filename of filenames) {
                await fs.unlink(path.join(getSettings().dataDir, filename));
            }
        }

        return mergedSession;
    },
);

ipcMain.handle(
    'save-message',
    async (
        event,
        filename: string,
        sender: string,
        message: string,
        index: number,
    ) => {
        if (!(await checkSessionFileExists(filename))) {
            console.error('Session file not found');
            return;
        }
        const data = await fs.readFile(
            path.join(getSettings().dataDir, filename),
            'utf8',
        );
        const parsed = JSON.parse(data) as SessionData;
        if (index < 0 || index >= parsed.entries.length) {
            console.error('Index out of range');
            return;
        }
        parsed.entries[index] = { ...parsed.entries[index], sender, message };
        let sessionPath = path.join(getSettings().dataDir, filename);

        const filesInDataDir = await fs.readdir(getSettings().dataDir);
        const date = filename.slice(0, 8);
        const senders = Array.from(
            new Set(
                parsed.entries.map((entry) => entry.sender.replace(/\W/g, '')),
            ),
        ).filter((sender) => sender.length > 0);
        sessionPath = createSessionPath(filesInDataDir, senders, date);
        await fs.rename(
            path.join(getSettings().dataDir, filename),
            sessionPath,
        );

        await fs.writeFile(
            sessionPath,
            JSON.stringify(parsed, undefined, 2),
            'utf8',
        );
        return;
    },
);

ipcMain.handle('import-conan-audit-logs', async (event, files: string[]) => {
    for (const filePath of files) {
        const data = await fs.readFile(filePath, 'utf8');
        const stat = await fs.stat(filePath);
        const createdMs =
            stat.birthtimeMs > 0
                ? stat.birthtimeMs
                : stat.ctimeMs || stat.mtimeMs;
        const baseDate = new Date(createdMs);
        const parsedEntries = parseConanAuditLogText(data, baseDate, filePath);
        if (parsedEntries.length === 0) {
            continue;
        }

        const importedSession: SessionData = {
            session: {
                notes: '',
                title: new Date(
                    parsedEntries[0].timestamp,
                ).toLocaleDateString(),
                createdAt: parsedEntries[0].timestamp,
                updatedAt: parsedEntries[parsedEntries.length - 1].timestamp,
            },
            entries: parsedEntries,
        };

        const senders = Array.from(
            new Set(
                parsedEntries.map((entry) => entry.sender.replace(/\W/g, '')),
            ),
        ).filter((sender) => sender.length > 0);

        const filesInDataDir = await fs.readdir(getSettings().dataDir);
        const date = parsedEntries[0].timestamp.slice(0, 10).replace(/-/g, '');
        const sessionPath = createSessionPath(filesInDataDir, senders, date);
        await fs.writeFile(
            sessionPath,
            JSON.stringify(importedSession, undefined, 2),
            'utf8',
        );
    }
});

type ParsedAuditLine = {
    time: string;
    sender: string | null;
    message: string;
};

function parseConanAuditLogText(
    content: string,
    baseDate: Date,
    sourcePath: string,
): ChatEntry[] {
    const lines = content.split(/\r?\n/);
    const entries: ChatEntry[] = [];
    let lastEntryIndex = -1;
    let dayOffset = 0;
    let previousTotalMinutes: number | null = null;

    for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        if (!line) {
            continue;
        }

        const parsedLine = parseAuditLine(line);
        if (!parsedLine) {
            if (lastEntryIndex >= 0) {
                entries[lastEntryIndex].message += `\n${line}`;
            }
            continue;
        }

        const [hour, minute] = parsedLine.time.split(':').map(Number);
        const currentMinutes = hour * 60 + minute;
        if (
            previousTotalMinutes !== null &&
            currentMinutes < previousTotalMinutes
        ) {
            dayOffset += 1;
        }
        previousTotalMinutes = currentMinutes;

        const timestampDate = new Date(baseDate);
        timestampDate.setHours(hour, minute, 0, 0);
        timestampDate.setDate(timestampDate.getDate() + dayOffset);
        const sender = parsedLine.sender || 'Unknown';
        const message = parsedLine.message;
        if (!message) {
            continue;
        }

        entries.push({
            timestamp: timestampDate.toISOString(),
            sender,
            message,
        });
        lastEntryIndex = entries.length - 1;
    }

    if (entries.length === 0) {
        console.warn(`No importable audit log lines found: ${sourcePath}`);
    }

    return entries;
}

function parseAuditLine(line: string): ParsedAuditLine | null {
    const timePrefixMatch = line.match(TIME_PREFIX_PATTERN);
    if (!timePrefixMatch) {
        return null;
    }

    const time = `${timePrefixMatch[1]}:${timePrefixMatch[2]}`;
    const rest = timePrefixMatch[3];
    const senderBeforeChannelMatch = rest.match(
        WITH_SENDER_BEFORE_CHANNEL_PATTERN,
    );
    if (senderBeforeChannelMatch?.groups) {
        return {
            time,
            sender: senderBeforeChannelMatch.groups.sender,
            message: senderBeforeChannelMatch.groups.message,
        };
    }

    const channelBeforeSenderMatch = rest.match(
        WITH_CHANNEL_BEFORE_SENDER_PATTERN,
    );
    if (channelBeforeSenderMatch?.groups) {
        return {
            time,
            sender: channelBeforeSenderMatch.groups.sender || 'Unknown',
            message:
                channelBeforeSenderMatch.groups.sender +
                ' ' +
                channelBeforeSenderMatch.groups.message,
        };
    }

    return {
        time,
        sender: null,
        message: rest,
    };
}

function parseYYYYMMDD(dateStr: string): Date {
    if (!/^\d{8}$/.test(dateStr)) {
        throw new Error('Invalid format. Expected YYYYMMDD');
    }

    const year = Number(dateStr.slice(0, 4));
    const month = Number(dateStr.slice(4, 6)) - 1;
    const day = Number(dateStr.slice(6, 8));

    return new Date(year, month, day);
}

async function checkSessionFileExists(filename: string): Promise<boolean> {
    try {
        if (!SESSION_FILE_PATTERN.test(filename)) {
            return false;
        }
        await fs.access(path.join(getSettings().dataDir, filename));
        return true;
    } catch {
        return false;
    }
}

async function getSessions(): Promise<DateSessions[]> {
    const files = await fs.readdir(getSettings().dataDir);
    const sessionsByDate: DateSessions[] = [];

    for (const filename of files) {
        if (!SESSION_FILE_PATTERN.test(filename)) {
            continue;
        }

        if (getSettings().hiddenSessions.includes(filename)) {
            continue;
        }

        const dateToken = filename.split('-')[0];
        const date = dateToken.replace(/\(\d+\)$/, '');
        const parsedDate = parseYYYYMMDD(date);
        const senders = filename
            .split('-')
            .slice(1)
            .map((sender) => sender.replace(/\.json$/, ''));
        if (
            senders.length === 0 ||
            senders.some((sender) => sender.length === 0)
        ) {
            continue;
        }

        let dateSession = sessionsByDate.find(
            (entry) => entry.date.getTime() === parsedDate.getTime(),
        );
        if (!dateSession) {
            dateSession = { date: parsedDate, sessions: [] };
            sessionsByDate.push(dateSession);
        }
        dateSession.sessions.push({ senders, filename });
    }

    const dataDir = getSettings().dataDir;

    for (const dateSessions of sessionsByDate) {
        const ordered = await Promise.all(
            dateSessions.sessions.map(async (session) => {
                const stat = await fs.stat(
                    path.join(dataDir, session.filename),
                );
                const createdMs =
                    stat.birthtimeMs > 0
                        ? stat.birthtimeMs
                        : stat.ctimeMs || stat.mtimeMs;
                return { session, sortKey: createdMs };
            }),
        );
        ordered.sort((a, b) => b.sortKey - a.sortKey);
        dateSessions.sessions = ordered.map(({ session }) => session);
    }

    return sessionsByDate;
}
