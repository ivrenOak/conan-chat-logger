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
import menuScreenshot from '../../public/menu.png';
import sudoexileScreenshot from '../../public/sudoexile.png';
import webhookScreenshot from '../../public/webhook.png';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';

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
            id: 'getting-started',
            title: 'Getting Started',
            description: 'Set up Conan Chat Logger in a few quick steps.',
        },
        {
            id: 'save-chats-to-folder',
            title: 'Save chats to a folder',
            description: 'Choose where chats should be stored.',
            content: (
                <div>
                    <Button
                        variant="outline"
                        onClick={() =>
                            window.api
                                .showOpenDialog({
                                    title: 'Select a folder',
                                    properties: [
                                        'openDirectory',
                                        'openDirectory',
                                    ],
                                })
                                .then((result) => {
                                    if (result.filePaths.length > 0) {
                                        setSettings({
                                            ...settings!,
                                            dataDir: result.filePaths[0],
                                        });
                                    }
                                })
                        }
                    >
                        Browse:{' '}
                        {settings?.dataDir
                            ? settings.dataDir
                            : 'No folder selected'}
                    </Button>
                </div>
            ),
        },
        {
            id: 'set-webhook-in-conan',
            title: 'Set a webhook in Conan',
            description:
                'Set an webhook in Conan to send chat logs to the app.',
            content: (
                <div className="space-y-4 text-sm">
                    <ol className="list-decimal space-y-4 pl-5">
                        <li>
                            <p>Open Conan and press ESC to open the menu.</p>
                        </li>
                        <li>
                            <p>
                                Click on SUDO Player Panel and then Chat & UI
                                Settings
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <img
                                    src={menuScreenshot}
                                    alt="Conan menu screenshot"
                                    className="h-auto w-full max-w-md rounded-md border object-contain"
                                />
                                <img
                                    src={sudoexileScreenshot}
                                    alt="Chat & UI Settings screen"
                                    className="h-auto w-1/2 max-w-md rounded-md border object-contain"
                                />
                            </div>
                        </li>
                        <li>
                            <p>
                                Check Enable Webhook and set the Webhook URL to:{' '}
                                <code>
                                    http://localhost:{settings.port}/conan
                                </code>
                            </p>
                            <img
                                src={webhookScreenshot}
                                alt="Example webhook setup details"
                                className="mt-2 w-3/4 max-w-3xl rounded-md border"
                            />
                        </li>
                    </ol>
                </div>
            ),
        },
        {
            id: 'set-session-timeout',
            title: 'Set the session timeout',
            description:
                'If you stop chatting for the selected amount of time, a new session will be started.',
            content: (
                <Field>
                    <FieldLabel htmlFor="session-timeout">
                        Session Timeout (minutes)
                    </FieldLabel>
                    <Input
                        id="session-timeout"
                        value={sessionTimeout}
                        aria-invalid={!isNumberValid}
                        onChange={(e) => {
                            const validatedValue = Number(e.target.value);
                            console.log(validatedValue);
                            const isValid =
                                !isNaN(validatedValue) && validatedValue > 0;
                            setIsNumberValid(isValid);
                            setSessionTimeout(e.target.value);
                        }}
                    />
                    {!isNumberValid && (
                        <FieldError>
                            Enter a positive number (minutes).
                        </FieldError>
                    )}
                </Field>
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
