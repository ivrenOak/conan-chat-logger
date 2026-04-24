import * as React from 'react';
import { RefreshCcwIcon } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { H3 } from './typography';
import { DateSessions } from 'src/handler/handleSessions';
import { SessionData } from 'src/handleMessage';
import { ButtonGroup } from './ui/button-group';
import { useEffect, useMemo, useState } from 'react';
import { Separator } from './ui/separator';
import { type DateRange } from 'react-day-picker';
import { SidebarSessionFilters } from './sidebar-session-filters';
import { SidebarSessionRowMenu } from './sidebar-session-row-menu';

export function AppSidebar({
    sessions,
    currentSessionFile,
    setCurrentSessionFile,
    setSessions,
    setCurrentSessionData,
    search,
    setSearch,
    ...props
}: React.ComponentProps<typeof Sidebar> & {
    sessions: DateSessions[];
    currentSessionFile: string | undefined;
    setCurrentSessionFile: (filename: string) => void;
    setSessions: (sessions: DateSessions[]) => void;
    setCurrentSessionData: (data: SessionData | undefined) => void;
    search: string;
    setSearch: (search: string) => void;
}) {
    const [locale, setLocale] = useState('en-US');
    const [selectedSenders, setSelectedSenders] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<DateRange | undefined>(
        undefined,
    );
    useEffect(() => {
        window.api.getLocale().then((value) => {
            setLocale(value ?? 'en-US');
        });
    }, []);

    const visibleSessions = useMemo(() => {
        let next: DateSessions[] = sessions;

        if (selectedSenders.length > 0) {
            next = next
                .map((dateSessions) => ({
                    ...dateSessions,
                    sessions: dateSessions.sessions.filter((session) =>
                        selectedSenders.every((selectedSender) =>
                            session.senders.includes(selectedSender),
                        ),
                    ),
                }))
                .filter((dateSessions) => dateSessions.sessions.length > 0);
        }

        if (selectedDate?.from) {
            const rangeStart = selectedDate.from.getTime();
            const rangeEnd = (selectedDate.to ?? selectedDate.from).getTime();
            next = next.filter((dateSessions) => {
                const day = dateSessions.date.getTime();
                return day >= rangeStart && day <= rangeEnd;
            });
        }

        return next;
    }, [sessions, selectedSenders, selectedDate]);

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 px-2 py-1.5">
                            <H3>Sessions</H3>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => {
                                    window.api.getSessions().then(setSessions);
                                    if (currentSessionFile) {
                                        window.api
                                            .getCurrentSessionData(
                                                currentSessionFile,
                                            )
                                            .then(setCurrentSessionData);
                                    }
                                }}
                                title="Reload sessions"
                                aria-label="Reload sessions"
                            >
                                <RefreshCcwIcon className="size-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
                <Separator />
                <SidebarSessionFilters
                    sessions={sessions}
                    search={search}
                    setSearch={setSearch}
                    setSessions={setSessions}
                    selectedSenders={selectedSenders}
                    setSelectedSenders={setSelectedSenders}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    locale={locale}
                />
                <Separator />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {visibleSessions.map((item) => (
                            <SidebarMenuItem
                                key={item.date.toLocaleDateString(locale)}
                            >
                                <div className="px-2 py-1.5">
                                    <p className="text-sm text-muted-foreground">
                                        {item.date.toLocaleDateString(locale)}
                                    </p>
                                </div>
                                {item.sessions.length > 0 ? (
                                    <SidebarMenuSub>
                                        {item.sessions.map(
                                            (
                                                session: DateSessions['sessions'][number],
                                            ) => (
                                                <SidebarMenuSubItem
                                                    key={session.filename}
                                                >
                                                    <ButtonGroup className="w-full">
                                                        <SidebarMenuSubButton
                                                            className="w-full"
                                                            isActive={
                                                                currentSessionFile ===
                                                                session.filename
                                                            }
                                                            onClick={() =>
                                                                setCurrentSessionFile(
                                                                    session.filename,
                                                                )
                                                            }
                                                            title={session.senders.join(
                                                                ', ',
                                                            )}
                                                        >
                                                            <span className="block w-full truncate whitespace-nowrap">
                                                                {session.senders.join(
                                                                    ', ',
                                                                )}
                                                            </span>
                                                        </SidebarMenuSubButton>

                                                        <SidebarSessionRowMenu
                                                            sessions={sessions}
                                                            session={session}
                                                            currentSessionFile={
                                                                currentSessionFile
                                                            }
                                                            setCurrentSessionFile={
                                                                setCurrentSessionFile
                                                            }
                                                            setSessions={
                                                                setSessions
                                                            }
                                                            setCurrentSessionData={
                                                                setCurrentSessionData
                                                            }
                                                        />
                                                    </ButtonGroup>
                                                </SidebarMenuSubItem>
                                            ),
                                        )}
                                    </SidebarMenuSub>
                                ) : null}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
