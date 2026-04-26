import { AppSidebar } from '@/components/app-sidebar';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { useEffect, useState } from 'react';
import type { DateSessions } from '../../src/handler/handleSessions';
import type { SessionData } from '../../src/handleMessage';
import { MessageItem } from '@/components/message-item';
import { TitleDialog } from '@/components/title-dialog';
import { AppSettings } from '@/components/settings';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { SettingsIcon } from 'lucide-react';
import { Settings } from 'src/settings';

export function ChatOverview() {
    const [sessions, setSessions] = useState<DateSessions[]>([]);
    const [currentSessionFile, setCurrentSessionFile] = useState<string>();
    const [currentSessionData, setCurrentSessionData] = useState<SessionData>();
    const currentEntries = currentSessionData?.entries ?? [];
    const [search, setSearch] = useState('');
    const [settings, setSettings] = useState<Settings>();
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        if (currentSessionFile) {
            window.api
                .getCurrentSessionData(currentSessionFile)
                .then((data) => {
                    setCurrentSessionData(data);
                });
        }
    }, [currentSessionFile]);

    useEffect(() => {
        window.api.getSessions().then(setSessions);
        window.api.getSettings().then(setSettings);
    }, [settingsOpen]);

    return (
        <SidebarProvider>
            <AppSidebar
                sessions={sessions}
                currentSessionFile={currentSessionFile}
                setCurrentSessionFile={setCurrentSessionFile}
                setSessions={setSessions}
                setCurrentSessionData={setCurrentSessionData}
                search={search}
                setSearch={setSearch}
            />
            <SidebarInset className="h-screen overflow-hidden">
                <header className="flex min-h-16 w-full shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                        <SidebarTrigger />
                        <div className="min-w-0">
                            <p className="flex items-center gap-1 text-left text-lg font-semibold">
                                {currentSessionData?.session.title
                                    ? currentSessionData.session.title
                                    : 'No session selected'}
                                {currentSessionData?.session.title &&
                                    currentSessionFile && (
                                        <TitleDialog
                                            titleValue={
                                                currentSessionData.session.title
                                            }
                                            setTitleValue={(value: string) =>
                                                window.api
                                                    .setSessionTitle(
                                                        currentSessionFile,
                                                        value,
                                                    )
                                                    .then(() =>
                                                        window.api.getCurrentSessionData(
                                                            currentSessionFile,
                                                        ),
                                                    )
                                                    .then((data) =>
                                                        setCurrentSessionData(
                                                            data,
                                                        ),
                                                    )
                                            }
                                        />
                                    )}
                            </p>
                            <p
                                className="text-sm text-muted-foreground overflow-hidden text-left"
                                title={
                                    currentEntries.length > 0
                                        ? [
                                              ...new Set(
                                                  currentEntries.map(
                                                      (entry) => entry.sender,
                                                  ),
                                              ),
                                          ].join(', ')
                                        : undefined
                                }
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {currentEntries.length > 0 &&
                                    [
                                        ...new Set(
                                            currentEntries.map(
                                                (entry) => entry.sender,
                                            ),
                                        ),
                                    ].join(', ')}
                            </p>
                        </div>
                    </div>
                    <ModeToggle />
                    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <SettingsIcon />
                            </Button>
                        </DialogTrigger>
                        <AppSettings open={settingsOpen} />
                    </Dialog>
                </header>
                <div className="flex-1 overflow-y-auto p-4">
                    <MessageItem entries={currentEntries} search={search} emoteType={settings?.emoteType ?? 'noFormating'} sayColor={settings?.sayColor} emoteColor={settings?.emoteColor} oocColor={settings?.oocColor} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
