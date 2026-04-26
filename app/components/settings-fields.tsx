import type { Settings } from '../../src/settings';
import { Button } from './ui/button';
import { Field, FieldDescription, FieldError, FieldTitle } from './ui/field';
import { Input } from './ui/input';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from './ui/combobox';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { XIcon } from 'lucide-react';
import menuScreenshot from '../../public/menu.png';
import sudoexileScreenshot from '../../public/sudoexile.png';
import webhookScreenshot from '../../public/webhook.png';
import emoteTypeScreenshot from '../../public/emotetype.png';
import totChatScreenshot from '../../public/totchat.png';
import { useState } from 'react';

export const settingsText = {
    gettingStarted: {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Set up Conan Chat Logger in a few quick steps.',
    },
    dataDir: {
        id: 'save-chats-to-folder',
        title: 'Save chats to a folder',
        description: 'Choose where chats should be stored.',
    },
    closeToSystemTray: {
        id: 'close-to-system-tray',
        title: 'Close to system tray',
        description:
            'Should the app be closed to the system tray? If you close the app to the system tray it will continue to log your chats in the background, otherwise it will stop.',
    },
    webhook: {
        id: 'set-webhook-in-conan',
        title: 'Set a webhook in Conan',
        description: 'Set an webhook in Conan to send chat logs to the app.',
    },
    emoteType: {
        id: 'set-emote-type',
        title: 'Select in message emote type',
        description:
            'In the Sudo Player Panel in Conan you can see the in message emote type you have selected.',
    },
    sessionTimeout: {
        id: 'set-session-timeout',
        title: 'Set the session timeout',
        description:
            'If you stop chatting for the selected amount of time, a new session will be started.',
    },
} as const;

const emoteTypeLabels: Record<Settings['emoteType'], string> = {
    noFormating: 'No Formating',
    quoteExclude: 'Quote Exclude',
    asteriskInclude: 'Asterisk Include',
    lessMoreInclude: 'Less More Include',
    asteriskExclude: 'Asterisk Exclude',
};

export function DataDirField({
    dataDir,
    onChange,
    showFieldInfo = false,
}: {
    dataDir: string;
    onChange: (nextDataDir: string) => void;
    showFieldInfo?: boolean;
}) {
    return (
        <Field>
            {showFieldInfo && (
                <>
                    <FieldTitle>{settingsText.dataDir.title}</FieldTitle>
                    <FieldDescription>{settingsText.dataDir.description}</FieldDescription>
                </>
            )}
            <Button
                variant="outline"
                onClick={() =>
                    window.api
                        .showOpenDialog({
                            title: 'Select a folder',
                            properties: ['openDirectory'],
                        })
                        .then((result) => {
                            if (result.filePaths.length > 0) {
                                onChange(result.filePaths[0]);
                            }
                        })
                }
            >
                Browse: {dataDir || 'No folder selected'}
            </Button>
        </Field>
    );
}

export function EmoteTypeField({
    emoteType,
    onChange,
    showFieldInfo = false,
}: {
    emoteType: Settings['emoteType'];
    onChange: (nextEmoteType: Settings['emoteType']) => void;
    showFieldInfo?: boolean;
}) {
    return (
        <Field>
            {showFieldInfo && (
                <>
                    <FieldTitle>{settingsText.emoteType.title}</FieldTitle>
                    <FieldDescription>{settingsText.emoteType.description}</FieldDescription>
                </>
            )}
                <div className="mt-2 flex gap-2">
                    <img
                        src={totChatScreenshot}
                        alt="Conan menu screenshot"
                        className="h-auto w-[300px] max-w-md rounded-md border object-contain"
                    />
                    <img
                        src={emoteTypeScreenshot}
                        alt="Chat & UI Settings screen"
                        className="h-auto w-[300px] max-w-md rounded-md border object-contain"
                    />
                </div>
            <Combobox 
                items={Object.keys(emoteTypeLabels)}
                value={emoteTypeLabels[emoteType] ?? 'noFormating'}
                onValueChange={(value) => {
                    onChange(value as Settings['emoteType']);
                }}
            >
                <ComboboxInput placeholder="Select an in message emote type" />
                <ComboboxContent className="pointer-events-auto">
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                    {(item: keyof typeof emoteTypeLabels) => (
                        <ComboboxItem key={item} value={item}>
                            {emoteTypeLabels[item]}
                        </ComboboxItem>
                    )}
                    </ComboboxList>
                </ComboboxContent>
                </Combobox>
        </Field>
    );
}

export function WebhookSetupField({ port, showFieldInfo = false }: { port: number, showFieldInfo?: boolean }) {
    return (
        <Field className="space-y-4 text-sm">
            {showFieldInfo && (
                <>
                    <FieldTitle>{settingsText.webhook.title}</FieldTitle>
                    <FieldDescription>{settingsText.webhook.description}</FieldDescription>
                </>
            )}
            <ol className="list-decimal space-y-4 pl-5">
                <li>
                    <p>Open Conan and press ESC to open the menu.</p>
                </li>
                <li>
                    <p>Click on SUDO Player Panel and then Chat & UI Settings</p>
                    <div className="mt-2 flex gap-2">
                        <img
                            src={menuScreenshot}
                            alt="Conan menu screenshot"
                            className="h-auto w-[500px] max-w-md rounded-md border object-contain"
                        />
                        <img
                            src={sudoexileScreenshot}
                            alt="Chat & UI Settings screen"
                            className="h-auto w-[250px] max-w-md rounded-md border object-contain"
                        />
                    </div>
                </li>
                <li>
                    <p>
                        Check Enable Webhook and set the Webhook URL to:{' '}
                        <code>http://localhost:{port}/conan</code>
                    </p>
                    <img
                        src={webhookScreenshot}
                        alt="Example webhook setup details"
                        className="mt-2 w-[900px] rounded-md border"
                    />
                </li>
            </ol>
        </Field>
    );
}

export function SessionTimeoutField({
    value,
    isValid,
    onValueChange,
    showFieldInfo = false,
}: {
    value: string;
    isValid: boolean;
    onValueChange: (nextValue: string, nextIsValid: boolean) => void;
    showFieldInfo?: boolean;
}) {
    return (
        <Field>
            {showFieldInfo && (
                <>
                    <FieldTitle>{settingsText.sessionTimeout.title}</FieldTitle>
                    <FieldDescription>{settingsText.sessionTimeout.description}</FieldDescription>
                </>
            )}
            <Input
                id="session-timeout"
                value={value}
                aria-invalid={!isValid}
                onChange={(e) => {
                    const nextValue = e.target.value;
                    const validatedValue = Number(nextValue);
                    const nextIsValid =
                        !isNaN(validatedValue) && validatedValue > 0;
                    onValueChange(nextValue, nextIsValid);
                }}
            />
            {!isValid && (
                <FieldError>Enter a positive number (minutes).</FieldError>
            )}
        </Field>
    );
}

export function CloseToSystemTrayField({
    checked,
    onChange,
    showFieldInfo = false,
}: {
    checked: boolean;
    onChange: (nextChecked: boolean) => void;
    showFieldInfo?: boolean;
}) {
    return (
        <Field className="w-full">
            {showFieldInfo && (
                <>
                    <FieldTitle>{settingsText.closeToSystemTray.title}</FieldTitle>
                    <FieldDescription>{settingsText.closeToSystemTray.description}</FieldDescription>
                </>
            )}
            <div className="flex items-center gap-2">
                <Checkbox
                    id="close-to-system-tray"
                    name="close-to-system-tray"
                    checked={checked}
                    onCheckedChange={(value: CheckedState) =>
                        onChange(value === 'indeterminate' ? false : value)
                    }
                />
                <Label
                    htmlFor="close-to-system-tray"
                >
                    Close to system tray
                </Label>
            </div>
        </Field>
    );
}

export function HiddenSessionsField({
    hiddenSessions,
    onChange,
    showFieldInfo = false,
}: {
    hiddenSessions: string[];
    onChange: (nextHiddenSessions: string[]) => void;
    showFieldInfo?: boolean;
}) {
    return (
        <Field>
            {showFieldInfo && (
                <>
                    <FieldTitle>Hidden sessions</FieldTitle>
                    <FieldDescription>Manage the sessions that should be hidden from the app.</FieldDescription>
                </>
            )}

            <div className="flex flex-col gap-2">
                {hiddenSessions.length === 0 && <p>No hidden sessions</p>}
                {hiddenSessions.map((session) => (
                    <div
                        key={session}
                        className="flex items-center justify-between gap-2 rounded-md border px-2 py-1"
                    >
                        <p className="text-sm break-all">{session}</p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Remove ${session} from hidden sessions`}
                            onClick={() =>
                                onChange(
                                    hiddenSessions.filter(
                                        (hiddenSession) =>
                                            hiddenSession !== session,
                                    ),
                                )
                            }
                        >
                            <XIcon className="size-3.5 text-muted-foreground" />
                        </Button>
                    </div>
                ))}
            </div>
        </Field>
    );
}

export function SetPortField({ port, isValid, onChange, showFieldInfo = false }: { port: string, isValid: boolean, onChange: (nextPort: string, nextIsValid: boolean) => void, showFieldInfo?: boolean }) {
    return (
        <Field>
            {showFieldInfo && (
                <>
                    <FieldTitle>Set the port</FieldTitle>
                    <FieldDescription>Don't change this if you don't know what you are doing! Set the port to listen for webhooks. You also have to change this in your Conan webhook settings. Restart the app after changing the port.</FieldDescription>
                </>
            )}
            <Input
                id="port"
                value={port}
                onChange={(e) => {
                    const nextValue = e.target.value;
                    const validatedValue = Number(nextValue);
                    const nextIsValid =
                        !isNaN(validatedValue) && validatedValue > 0 && validatedValue < 65536;
                    onChange(nextValue, nextIsValid);
                }}
            />
            {!isValid && (
                <FieldError>Enter a positive number (1-65535).</FieldError>
            )}
        </Field>
    );
}