import * as React from 'react';
import {
    EyeOffIcon,
    MoreVerticalIcon,
    SplitIcon,
    Trash2Icon,
} from 'lucide-react';
import { DateSessions } from 'src/handler/handleSessions';
import { SessionData } from 'src/handleMessage';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Field, FieldError, FieldLabel } from './ui/field';
import { MessageItem } from './message-item';
import { SidebarMenuSubButton } from '@/components/ui/sidebar';
import { useState } from 'react';

type SidebarSessionRowMenuProps = {
    session: DateSessions['sessions'][number];
    currentSessionFile: string | undefined;
    setCurrentSessionFile: (filename: string) => void;
    setSessions: (sessions: DateSessions[]) => void;
    setCurrentSessionData: (data: SessionData | undefined) => void;
};

export function SidebarSessionRowMenu({
    session,
    currentSessionFile,
    setCurrentSessionFile,
    setSessions,
    setCurrentSessionData,
}: SidebarSessionRowMenuProps) {
    const [splitSessionData, setSplitSessionData] = useState<
        SessionData | undefined
    >();
    const [isNumberValid, setIsNumberValid] = useState<boolean>(true);
    const [splitAfter, setSplitAfter] = useState<string>('');

    const loadSplitSessionData = (filename: string) => {
        void window.api
            .getCurrentSessionData(filename)
            .then(setSplitSessionData);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuSubButton
                    isActive={currentSessionFile === session.filename}
                >
                    <MoreVerticalIcon className=" text-muted-foreground" />
                </SidebarMenuSubButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-50">
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick={() => {
                            window.api
                                .setSessionHidden(session.filename, true)
                                .then(() => {
                                    window.api.getSessions().then(setSessions);
                                });
                        }}
                    >
                        <EyeOffIcon /> Hide from app
                    </DropdownMenuItem>
                    <Dialog>
                        <DialogTrigger asChild>
                            <DropdownMenuItem
                                onSelect={(event) => event.preventDefault()}
                                onClick={() =>
                                    loadSplitSessionData(session.filename)
                                }
                            >
                                <SplitIcon /> Split into multiple sessions
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle>
                                    Split into multiple sessions
                                </DialogTitle>
                                <DialogDescription>
                                    After which message you want to split the
                                    session.
                                </DialogDescription>
                                <Field>
                                    <FieldLabel htmlFor="session-timeout">
                                        Write the message number you want to
                                        split the session after
                                    </FieldLabel>
                                    <Input
                                        id="session-timeout"
                                        value={splitAfter}
                                        aria-invalid={!isNumberValid}
                                        onChange={(e) => {
                                            const validatedValue = Number(
                                                e.target.value,
                                            );
                                            const isValid =
                                                !isNaN(validatedValue) &&
                                                validatedValue > 0;
                                            setIsNumberValid(isValid);
                                            setSplitAfter(e.target.value);
                                        }}
                                    />
                                    {!isNumberValid && (
                                        <FieldError>Enter a number.</FieldError>
                                    )}
                                </Field>
                            </DialogHeader>
                            <MessageItem
                                entries={splitSessionData?.entries ?? []}
                                showNumbers
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button
                                        type="submit"
                                        onClick={() => {
                                            if (!isNumberValid) {
                                                return;
                                            }
                                            window.api
                                                .splitSession(
                                                    session.filename,
                                                    Number(splitAfter),
                                                )
                                                .then(() => {
                                                    window.api
                                                        .getSessions()
                                                        .then(setSessions);
                                                    if (
                                                        currentSessionFile ===
                                                        session.filename
                                                    ) {
                                                        setCurrentSessionFile(
                                                            '',
                                                        );
                                                        setCurrentSessionData(
                                                            undefined,
                                                        );
                                                    }
                                                });
                                        }}
                                    >
                                        Split Session
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <DropdownMenuItem
                                onSelect={(event) => event.preventDefault()}
                            >
                                <Trash2Icon />
                                Delete session
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Delete session</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this
                                    session? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button
                                        type="submit"
                                        onClick={() => {
                                            window.api
                                                .deleteSession(session.filename)
                                                .then(() => {
                                                    window.api
                                                        .getSessions()
                                                        .then(setSessions);
                                                    if (
                                                        currentSessionFile ===
                                                        session.filename
                                                    ) {
                                                        setCurrentSessionFile(
                                                            '',
                                                        );
                                                        setCurrentSessionData(
                                                            undefined,
                                                        );
                                                    }
                                                });
                                        }}
                                    >
                                        Delete Session
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
