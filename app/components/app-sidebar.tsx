import * as React from 'react';
import { EyeOffIcon, RefreshCcwIcon, SearchIcon, SplitIcon, Trash2Icon, XIcon } from 'lucide-react';
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
import { Input } from './ui/input';
import { ButtonGroup } from './ui/button-group';
import { useEffect, useMemo, useState } from 'react';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from './ui/combobox';
import { Field, FieldError, FieldLabel } from './ui/field';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { type DateRange } from 'react-day-picker';
import { Calendar } from './ui/calendar';
import { MoreVerticalIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuItem, DropdownMenuGroup, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTrigger } from './ui/dialog';
import { DialogHeader } from './ui/dialog';
import { DialogTitle } from './ui/dialog';
import { MessageItem } from './message-item';

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
    const anchor = useComboboxAnchor();
    const [locale, setLocale] = useState('en-US');
    const [selectedSenders, setSelectedSenders] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<DateRange | undefined>(
        undefined,
    );
    const [splitSessionData, setSplitSessionData] = useState<SessionData | undefined>();
    const [isNumberValid, setIsNumberValid] = useState<boolean>(true);
    const [splitAfter, setSplitAfter] = useState<string>('');

    const handleSplitSessionDialogOpenChange = async (
        filename: string,
    ) => {
        const data = await window.api.getCurrentSessionData(filename);
        setSplitSessionData(data);
    };


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
                <ButtonGroup className="px-2 py-1.5">
                    <Input
                        placeholder="Search..."
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        variant="outline"
                        aria-label="Search"
                        onClick={() =>
                            window.api
                                .filterSessionsBySearch(search)
                                .then(setSessions)
                        }
                    >
                        <SearchIcon />
                    </Button>
                </ButtonGroup>
                <Field className="px-2 py-1.5 text-muted-foreground">
                    <FieldLabel>Filter by participants</FieldLabel>
                    <Combobox
                        multiple
                        autoHighlight
                        items={[
                            ...new Set(
                                sessions.flatMap((dateSessions) =>
                                    dateSessions.sessions.flatMap(
                                        (session) => session.senders,
                                    ),
                                ),
                            ),
                        ]}
                        value={selectedSenders}
                        onValueChange={(value) => setSelectedSenders(value)}
                    >
                        <ComboboxChips ref={anchor} className="w-full">
                            <ComboboxValue>
                                {(values) => (
                                    <React.Fragment>
                                        {values.map((value: string) => (
                                            <ComboboxChip key={value}>
                                                {value}
                                            </ComboboxChip>
                                        ))}
                                        <ComboboxChipsInput
                                            className="placeholder:text-muted-foreground"
                                            placeholder={
                                                selectedSenders.length === 0
                                                    ? 'Add participant'
                                                    : ''
                                            }
                                        />
                                    </React.Fragment>
                                )}
                            </ComboboxValue>
                        </ComboboxChips>
                        <ComboboxContent anchor={anchor}>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item) => (
                                    <ComboboxItem key={item} value={item}>
                                        {item}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </Field>
                <Field className="gap-1.5 px-2 py-1.5">
                    <FieldLabel className="text-sm text-muted-foreground">
                        Filter by date
                    </FieldLabel>
                    <ButtonGroup className="w-full">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date-picker-range"
                                    className="h-9 w-full min-w-0 flex-1 justify-start px-2.5 font-normal"
                                >
                                    {selectedDate?.from ? (
                                        selectedDate.to ? (
                                            <>
                                                {selectedDate.from.toLocaleDateString(
                                                    locale,
                                                )}
                                                -{' '}
                                                {selectedDate.to.toLocaleDateString(
                                                    locale,
                                                )}
                                            </>
                                        ) : (
                                            selectedDate.from.toLocaleDateString(
                                                locale,
                                            )
                                        )
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Pick a date
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    defaultMonth={selectedDate?.from}
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        {selectedDate ? (
                            <Button
                                variant="outline"
                                onClick={() => setSelectedDate(undefined)}
                                title="Clear date filter"
                                aria-label="Clear date filter"
                            >
                                <XIcon className="size-4 text-muted-foreground" />
                            </Button>
                        ) : null}
                    </ButtonGroup>
                </Field>
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
                                                    <ButtonGroup className="w-full" >
                                                        <SidebarMenuSubButton className="w-full"
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
                                                        

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                            <SidebarMenuSubButton
                                                                isActive={
                                                                    currentSessionFile ===
                                                                    session.filename
                                                                }
                                                            >
                                                                <MoreVerticalIcon className=" text-muted-foreground" />
                                                            </SidebarMenuSubButton>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-50">
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem onClick={() => {
                                                                    window.api.setSessionHidden(session.filename, true).then(() => {
                                                                        window.api.getSessions().then(setSessions);
                                                                    });
                                                                }}><EyeOffIcon /> Hide from app</DropdownMenuItem>
                                                                <Dialog>
                                                                    <DialogTrigger asChild><DropdownMenuItem onSelect={(event) => event.preventDefault() } onClick={() => handleSplitSessionDialogOpenChange(session.filename)}>
                                                                        <SplitIcon /> Split into multiple sessions
                                                                    </DropdownMenuItem></DialogTrigger>
                                                                    <DialogContent className="sm:max-w-sm">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Split into multiple sessions</DialogTitle>
                                                                            <DialogDescription>After which message you want to split the session.</DialogDescription>
                                                                            <Field>
                                                                                <FieldLabel htmlFor="session-timeout">
                                                                                    Write the message number you want to split the session after
                                                                                </FieldLabel>
                                                                                <Input
                                                                                    id="session-timeout"
                                                                                    value={splitAfter}
                                                                                    aria-invalid={!isNumberValid}
                                                                                    onChange={(e) => {
                                                                                        const validatedValue = Number(e.target.value);
                                                                                        const isValid =
                                                                                            !isNaN(validatedValue) && validatedValue > 0;
                                                                                        setIsNumberValid(isValid);
                                                                                        setSplitAfter(e.target.value);
                                                                                    }}
                                                                                />
                                                                                {!isNumberValid && (
                                                                                    <FieldError>
                                                                                        Enter a number.
                                                                                    </FieldError>
                                                                                )}
                                                                            </Field>
                                                                        </DialogHeader>
                                                                        <MessageItem entries={splitSessionData?.entries ?? []} showNumbers={true} />
                                                                        <DialogFooter>
                                                                            <DialogClose asChild>
                                                                                <Button variant="outline">Cancel</Button>
                                                                            </DialogClose>
                                                                            <DialogClose asChild>
                                                                                <Button type="submit" onClick={() => {
                                                                                    if(!isNumberValid){
                                                                                        return
                                                                                    }
                                                                                    window.api.splitSession(session.filename, Number(splitAfter)).then(() => {
                                                                                        window.api.getSessions().then(setSessions);
                                                                                        if (currentSessionFile === session.filename) {
                                                                                            setCurrentSessionFile('');
                                                                                            setCurrentSessionData(undefined);
                                                                                        }
                                                                                    });
                                                                                }}>Split Session
                                                                                </Button>
                                                                            </DialogClose>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <DropdownMenuItem
                                                                            onSelect={(event) =>
                                                                                event.preventDefault()
                                                                            }
                                                                        >
                                                                            <Trash2Icon />
                                                                            Delete session
                                                                        </DropdownMenuItem>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="sm:max-w-sm">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Delete session</DialogTitle>
                                                                        <DialogDescription>Are you sure you want to delete this session? This action cannot be undone.</DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter>
                                                                        <DialogClose asChild>
                                                                        <Button variant="outline">Cancel</Button>
                                                                        </DialogClose>
                                                                        <DialogClose asChild>
                                                                        <Button type="submit" onClick={() => {
                                                                            window.api.deleteSession(session.filename).then(() => {
                                                                                window.api.getSessions().then(setSessions);
                                                                                if (currentSessionFile === session.filename) {
                                                                                    setCurrentSessionFile('');
                                                                                    setCurrentSessionData(undefined);
                                                                                }
                                                                            });
                                                                        }}>Delete Session</Button>
                                                                        </DialogClose>
                                                                    </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </DropdownMenuGroup>

                                                        </DropdownMenuContent>
                                                        </DropdownMenu>
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
