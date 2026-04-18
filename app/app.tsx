import { useEffect, useState } from 'react';
import type { Settings } from '../src/settings';
import { ChatOverview } from './pages/chatoverview';
import { Onboarding } from './pages/onboarding';

export function App() {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        window.api.getSettings().then(setSettings);
    }, []);

    return settings?.onboardingCompleted ? <ChatOverview /> : <Onboarding />;
}