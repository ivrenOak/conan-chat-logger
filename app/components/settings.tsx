import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from './ui/sidebar';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import type { Settings } from '../../src/settings';
import {
    CloseToSystemTrayField,
    DataDirField,
    EmoteTypeField,
    HiddenSessionsField,
    SessionTimeoutField,
    SetInMessageColorField,
    SetPortField,
    WebhookSetupField,
} from './settings-fields';

export function AppSettings({
    open,
    onSettingsSaved,
}: {
    open: boolean;
    onSettingsSaved?: (nextSettings: Settings) => void;
}) {
    type SettingsSection =
        | 'general'
        | 'conan-webhook'
        | 'message-highlighting'
        | 'hidden-sessions';

    const sectionTitles = {
        general: 'General',
        'conan-webhook': 'Conan Webhook',
        'message-highlighting': 'Message Highlighting',
        'hidden-sessions': 'Hidden Sessions',
    };

    const [settings, setSettings] = useState<Settings | null>(null);
    const [sessionTimeout, setSessionTimeout] = useState(settings?.sessionGapMinutes?.toString() ?? '');
    const [isNumberValid, setIsNumberValid] = useState(settings?.sessionGapMinutes ? true : false);
    const [selectedSection, setSelectedSection] =
        useState<SettingsSection>('general');
    const [port, setPort] = useState(settings?.port?.toString() ?? '');
    const [isPortValid, setIsPortValid] = useState(settings?.port ? true : false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [sayColor, setSayColor] = useState(settings?.sayColor ?? '#000000');
    const [emoteColor, setEmoteColor] = useState(settings?.emoteColor ?? '#68A6FF');
    const [oocColor, setOocColor] = useState(settings?.oocColor ?? '#8A8A8A');

    useEffect(() => {
        if (open) {
            window.api.getSettings().then(() => {
                resetSettingsState();
                setSelectedSection('general');
            });
            return;
        }
    }, [open]);

    async function updateSettings(partial: Partial<Settings>) {
        if (!settings) {
            return;
        }
        setSettings({...settings, ...partial});
        setHasUnsavedChanges(true);
    }

    useEffect(() => {
        resetSettingsState();
    }, [selectedSection]);

    function resetSettingsState() {
        window.api.getSettings().then((settings) => {
            setSettings(settings);
            setSessionTimeout(settings.sessionGapMinutes.toString());
            setIsNumberValid(true);
            setPort(settings.port.toString());
            setIsPortValid(true);
            setHasUnsavedChanges(false);
        });
    }

    function handleSave() {
        if (!settings || !isNumberValid || !isPortValid) {
            return;
        }
        window.api.setSettings(settings).then(() => {
            onSettingsSaved?.(settings);
            resetSettingsState();
        });
    }

    function isValidColor(color: string) {
        return /^#([0-9a-fA-F]{6})$/.test(color);
    }

    return (
        <DialogContent className="h-[80vh] w-[90vw] !max-w-[1100px] overflow-hidden p-0 gap-0">
            <DialogHeader className="sr-only">
                <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <DialogDescription className="sr-only">
                Settings for Conan Chat Logger.
            </DialogDescription>
            <SidebarProvider className="min-h-0 h-full">
                <Sidebar collapsible="none" className="h-full border-r w-[200px]">
                    <SidebarHeader>
                        <div className="px-2 py-1.5 text-lg font-semibold">
                            Settings
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Sections</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={selectedSection === 'general'}
                                            onClick={() =>
                                                setSelectedSection('general')
                                            }
                                        >
                                            General
                                        </SidebarMenuButton>
                                        <SidebarMenuButton
                                            isActive={
                                                selectedSection ===
                                                'conan-webhook'
                                            }
                                            onClick={() =>
                                                setSelectedSection(
                                                    'conan-webhook',
                                                )
                                            }
                                        >
                                            Conan Webhook
                                        </SidebarMenuButton>
                                        <SidebarMenuButton
                                            isActive={
                                                selectedSection ===
                                                'message-highlighting'
                                            }
                                            onClick={() =>
                                                setSelectedSection(
                                                    'message-highlighting',
                                                )
                                            }
                                        >
                                            Message Highlighting
                                        </SidebarMenuButton>
                                        <SidebarMenuButton
                                            isActive={
                                                selectedSection ===
                                                'hidden-sessions'
                                            }
                                            onClick={() =>
                                                {
                                                    setSelectedSection(
                                                    'hidden-sessions',
                                                )
                                                window.api.getSettings().then(setSettings);
                                                }
                                            }
                                        >
                                            Hidden Sessions
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
                <SidebarInset className="h-full min-h-0 flex flex-col justify-start overflow-hidden">
                    <header className="flex min-h-16 items-center gap-2 border-b px-3 py-2">
                        <p className="text-lg font-semibold">{sectionTitles[selectedSection]}</p>
                    </header>
                    <div className="flex-1 space-y-8 overflow-y-auto p-4">
                        {selectedSection === 'general' && (
                            <section className="space-y-8">
                                <DataDirField
                                    showFieldInfo
                                    dataDir={settings?.dataDir ?? ''}
                                    onChange={(dataDir) => {
                                        void updateSettings({ dataDir });
                                    }}
                                />
                                <SessionTimeoutField
                                    showFieldInfo
                                    value={sessionTimeout}
                                    isValid={isNumberValid}
                                    onValueChange={(
                                        nextValue,
                                        nextIsValid,
                                    ) => {
                                        setSessionTimeout(nextValue);
                                        setIsNumberValid(nextIsValid);
                                        setHasUnsavedChanges(true);
                                        if (nextIsValid) {
                                            void updateSettings({
                                                sessionGapMinutes:
                                                    Number(nextValue),
                                            });
                                        }
                                    }}
                                />
                                <CloseToSystemTrayField
                                    showFieldInfo
                                    checked={
                                        settings?.closeToSystemTray ?? false
                                    }
                                    onChange={(closeToSystemTray) => {
                                        void updateSettings({
                                            closeToSystemTray,
                                        });
                                    }}
                                />
                            </section>
                        )}

                        {selectedSection === 'conan-webhook' && (
                            <section className="space-y-8">
                                <WebhookSetupField
                                    showFieldInfo={true}
                                    port={settings?.port ?? 30128}
                                />
                                <SetPortField
                                    showFieldInfo
                                    port={port}
                                    isValid={isPortValid}
                                    onChange={(nextPort, nextIsValid) => {
                                        setPort(nextPort);
                                        setIsPortValid(nextIsValid);
                                        setHasUnsavedChanges(true);
                                        if (nextIsValid) {
                                            void updateSettings({ port: Number(nextPort) });
                                        }
                                    }}
                                />
                            </section>
                        )}

                        {selectedSection === 'message-highlighting' && (
                            <section className="space-y-8">
                                <EmoteTypeField
                                    showFieldInfo
                                    emoteType={
                                        settings?.emoteType ?? 'noFormating'
                                    }
                                    onChange={(emoteType) => {
                                        void updateSettings({ emoteType });
                                    }}
                                />
                                <SetInMessageColorField
                                    showFieldInfo
                                    sayColor={sayColor}
                                    emoteColor={emoteColor}
                                    oocColor={oocColor}
                                    isValidColor={isValidColor}
                                    onChange={(sayColor, emoteColor, oocColor) => {
                                        setSayColor(sayColor);
                                        setEmoteColor(emoteColor);
                                        setOocColor(oocColor);
                                        setHasUnsavedChanges(true);
                                        if (isValidColor(sayColor) && isValidColor(emoteColor) && isValidColor(oocColor)) {
                                            void updateSettings({ sayColor, emoteColor, oocColor });
                                        }
                                    }}
                                />
                            </section>
                        )}

                        {selectedSection === 'hidden-sessions' && (
                            <section className="space-y-8">
                                <HiddenSessionsField
                                    showFieldInfo
                                    hiddenSessions={settings?.hiddenSessions ?? []}
                                    onChange={(hiddenSessions) => updateSettings({ hiddenSessions })}
                                />
                            </section>
                        )}
                    </div>
                    {hasUnsavedChanges && (
                        <footer className="flex items-center justify-end gap-2 border-t px-4 py-3">
                            <Button variant="outline" onClick={resetSettingsState}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    void handleSave();
                                }}
                                disabled={!isNumberValid || !isPortValid}
                            >
                                Save
                            </Button>
                        </footer>
                    )}
                </SidebarInset>
            </SidebarProvider>
        </DialogContent>
    );
}
