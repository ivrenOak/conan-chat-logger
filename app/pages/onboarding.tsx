import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import type { Settings } from '../../src/settings';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    CloseToSystemTrayField,
    DataDirField,
    EmoteTypeField,
    SessionTimeoutField,
    settingsText,
    WebhookSetupField,
} from '@/components/settings-fields';
  
export function Onboarding(props: {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}) {
    const { settings, setSettings } = props;
    const [activeStep, setActiveStep] = useState(0);
    const [isNumberValid, setIsNumberValid] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState(
        settings.sessionGapMinutes.toString(),
    );

    const steps = [
        {
            id: settingsText.gettingStarted.id,
            title: settingsText.gettingStarted.title,
            description: settingsText.gettingStarted.description,
        },
        {
            id: settingsText.dataDir.id,
            title: settingsText.dataDir.title,
            description: settingsText.dataDir.description,
            content: (
                <DataDirField
                    dataDir={settings.dataDir}
                    onChange={(dataDir) =>
                        setSettings({
                            ...settings,
                            dataDir,
                        })
                    }
                />
            ),
        },
        {
            id: settingsText.closeToSystemTray.id,
            title: settingsText.closeToSystemTray.title,
            description: settingsText.closeToSystemTray.description,
            content: (
                <CloseToSystemTrayField
                    checked={settings.closeToSystemTray}
                    onChange={(closeToSystemTray) =>
                        setSettings({
                            ...settings,
                            closeToSystemTray,
                        })
                    }
                />
            ),
        },
        {
            id: settingsText.webhook.id,
            title: settingsText.webhook.title,
            description: settingsText.webhook.description,
            content: <WebhookSetupField port={settings.port} />,
        },
        {
            id: settingsText.emoteType.id,
            title: settingsText.emoteType.title,
            description: settingsText.emoteType.description,
            content: (
                <EmoteTypeField
                    emoteType={settings.emoteType}
                    onChange={(emoteType) =>
                        setSettings({
                            ...settings,
                            emoteType,
                        })
                    }
                />
            ),
        },
        {
            id: settingsText.sessionTimeout.id,
            title: settingsText.sessionTimeout.title,
            description: settingsText.sessionTimeout.description,
            content: (
                <SessionTimeoutField
                    value={sessionTimeout}
                    isValid={isNumberValid}
                    onValueChange={(nextValue, nextIsValid) => {
                        setSessionTimeout(nextValue);
                        setIsNumberValid(nextIsValid);
                    }}
                />
            ),
        },
    ];

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
            <ScrollArea>
                <Card className="mx-auto w-fit min-w-sm max-w-full">
                    <CardHeader>
                        <div className="mb-4 flex items-center justify-end space-x-4">
                            <span className="text-muted-foreground text-sm">
                                Step {activeStep + 1}/{steps.length}
                            </span>
                            <Progress
                                className="w-32"
                                value={((activeStep + 1) / steps.length) * 100}
                            />
                        </div>
                        <CardTitle>{steps[activeStep].title}</CardTitle>
                        <CardDescription>
                            {steps[activeStep].description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>{steps[activeStep].content}</CardContent>
                    <CardFooter>
                        <div className="flex items-center w-full">
                            {activeStep > 0 && (
                                <Button
                                    className="mr-auto"
                                    variant="outline"
                                    onClick={() =>
                                        setActiveStep(activeStep - 1)
                                    }
                                >
                                    Previous Step
                                </Button>
                            )}
                            {activeStep < steps.length - 1 && (
                                <Button
                                    className="ml-auto"
                                    variant="default"
                                    onClick={() =>
                                        setActiveStep(activeStep + 1)
                                    }
                                >
                                    Next Step
                                </Button>
                            )}
                            {activeStep === steps.length - 1 && (
                                <Button
                                    className="ml-auto"
                                    variant="default"
                                    onClick={() => {
                                        if (!isNumberValid) {
                                            return;
                                        }
                                        const newSettings = {
                                            ...settings!,
                                            onboardingCompleted: true,
                                            sessionGapMinutes:
                                                Number(sessionTimeout),
                                        };
                                        setSettings(newSettings);
                                        window.api.setSettings(newSettings);
                                    }}
                                >
                                    Finish
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </ScrollArea>
        </div>
    );
}
