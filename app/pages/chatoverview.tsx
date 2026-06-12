import { AppSidebar } from '@/components/app-sidebar';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { useEffect, useState } from 'react';
import type { DateSessions } from '../../src/handler/handleSessions';
import type { ChatEntry, SessionData } from '../../src/handleMessage';
import { MessageItem } from '@/components/message-item';
import { TitleDialog } from '@/components/title-dialog';
import { AppSettings } from '@/components/settings';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
    MessageSquareHeartIcon,
    PanelRightIcon,
    SettingsIcon,
} from 'lucide-react';
import { Settings } from 'src/settings';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { ParticipantsPanel } from '@/components/participants-panel';

export function ChatOverview() {
    const [sessions, setSessions] = useState<DateSessions[]>([]);
    const [currentSessionFile, setCurrentSessionFile] = useState<string>();
    const [currentSessionData, setCurrentSessionData] = useState<SessionData>();
    const currentEntries = currentSessionData?.entries ?? [];
    const [search, setSearch] = useState('');
    const [settings, setSettings] = useState<Settings>();
    const [settingsOpen, setSettingsOpen] = useState(false);
    // const [autoUpdateDialogOpen, setAutoUpdateDialogOpen] = useState(false);
    const [showParticipants, setShowParticipants] = useState(true);
    const [selectedSenders, setSelectedSenders] = useState<string[]>([]);
    const [selectedMentions, setSelectedMentions] = useState<string[]>([]);

    async function onEditMessageSave(
        sender: string,
        message: string,
        index: number,
    ) {
        if (!currentSessionFile) {
            return;
        }
        const filenameAfterSave = await window.api.saveMessage(
            currentSessionFile,
            sender,
            message,
            index,
        );
        window.api.getSessions().then((sessions) => {
            setSessions(sessions);
            setCurrentSessionFile(filenameAfterSave);
        });
    }

    useEffect(() => {
        if (currentSessionFile) {
            window.api
                .getCurrentSessionData(currentSessionFile)
                .then((data) => {
                    setCurrentSessionData(data);
                    setSelectedSenders([]);
                    setSelectedMentions([]);
                });
        }
    }, [currentSessionFile]);

    useEffect(() => {
        window.api.getSessions().then(setSessions);
        window.api.getSettings().then((loadedSettings) => {
            setSettings(loadedSettings);
        });
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
                        </div>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <MessageSquareHeartIcon />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <FeedbackDialog />
                        </DialogContent>
                    </Dialog>
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
                {currentEntries.length > 0 && (
                    <>
                        <div className="flex overflow-hidden">
                            <div className="min-w-0 flex-1 overflow-y-auto p-4">
                                <MessageItem
                                    entries={currentEntries}
                                    search={search}
                                    emoteType={
                                        settings?.emoteType ?? 'noFormating'
                                    }
                                    selectedSenders={selectedSenders}
                                    selectedMentions={selectedMentions}
                                    onEditMessageSave={onEditMessageSave}
                                    sayColor={
                                        document.documentElement.classList.contains(
                                            'dark',
                                        )
                                            ? (settings?.darkSayColor ??
                                              '#FFFFFF')
                                            : (settings?.sayColor ?? '#000000')
                                    }
                                    emoteColor={
                                        document.documentElement.classList.contains(
                                            'dark',
                                        )
                                            ? (settings?.darkEmoteColor ??
                                              '#FDE68A')
                                            : (settings?.emoteColor ??
                                              '#B45309')
                                    }
                                    oocColor={
                                        document.documentElement.classList.contains(
                                            'dark',
                                        )
                                            ? (settings?.darkOocColor ??
                                              '#8A8A8A')
                                            : (settings?.oocColor ?? '#8A8A8A')
                                    }
                                />
                            </div>
                            {showParticipants ? (
                                <ParticipantsPanel
                                    entries={currentEntries}
                                    selectedSenders={selectedSenders}
                                    onSelectedSendersChange={setSelectedSenders}
                                    onHide={() => setShowParticipants(false)}
                                    selectedMentions={selectedMentions}
                                    onSelectedMentionsChange={
                                        setSelectedMentions
                                    }
                                />
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() =>
                                        setShowParticipants(!showParticipants)
                                    }
                                >
                                    <PanelRightIcon />
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
