import { useEffect, useState } from 'react';
import type { Settings } from '../src/settings';
import { ChatOverview } from './pages/chatoverview';
import { Onboarding } from './pages/onboarding';
import { ThemeProvider } from './components/theme-provider';

export function App() {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        window.api.getSettings().then(setSettings);
    }, []);

    if (!settings) {
        return <div>Loading...</div>;
    }

    return (
        <ThemeProvider defaultTheme="system">
            {settings?.onboardingCompleted ? (
                <ChatOverview />
            ) : (
                <Onboarding settings={settings!} setSettings={setSettings} />
            )}
        </ThemeProvider>
    );
}
