import { app, autoUpdater, dialog } from 'electron';
import { format } from 'node:util';

const owner = 'ivrenOak';
const repo = 'conan-chat-logger';
const updateUrl = `https://update.electronjs.org/${owner}/${repo}/${process.platform}-${process.arch}/${app.getVersion()}`;

async function fetchLatestReleaseTag(): Promise<string | null> {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const res = await fetch(url, {
        headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { tag_name?: string };
    return data.tag_name ?? null;
}

function normalizeVersion(v: string): string {
    return v.replace(/^v/i, '').trim();
}

/** true if `remoteTag` is strictly greater than `current` (simple x.y.z-style). */
function isRemoteNewer(remoteTag: string, current: string): boolean {
    const r = normalizeVersion(remoteTag)
        .split('.')
        .map((n) => parseInt(n, 10) || 0);
    const c = normalizeVersion(current)
        .split('.')
        .map((n) => parseInt(n, 10) || 0);
    const len = Math.max(r.length, c.length);
    for (let i = 0; i < len; i++) {
        const rv = r[i] ?? 0;
        const cv = c[i] ?? 0;
        if (rv > cv) return true;
        if (rv < cv) return false;
    }
    return false;
}

export async function checkAndInstallUpdate() {
    if (!app.isPackaged || process.argv.includes('--squirrel-firstrun')) {
        return;
    }

    const latestTag = await fetchLatestReleaseTag();
    if (!latestTag || !isRemoteNewer(latestTag, app.getVersion())) {
        return;
    }

    autoUpdater.setFeedURL({
        url: updateUrl,
        serverType: 'default',
        headers: {
            'User-Agent': format(
                '%s/%s (%s: %s)',
                app.getName(),
                app.getVersion(),
                process.platform,
                process.arch,
            ),
        },
    });

    autoUpdater.on('update-downloaded', () => {
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on('error', (err) => {
        console.error('[updater]', err);
    });

    dialog
        .showMessageBox({
            type: 'info',
            buttons: ['Install now', 'Later'],
            defaultId: 0,
            cancelId: 1,
            title: 'New update available',
            message: 'A new update is available. Install it now?',
        })
        .then(({ response }) => {
            if (response === 0) {
                autoUpdater.checkForUpdates();
            }
        });
}
