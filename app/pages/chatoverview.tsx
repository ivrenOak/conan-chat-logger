import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { DateSessions } from "src/handler/handleSessions";
import type { ChatEntry } from "src/handleMessage";

export function ChatOverview() {
    const [sessions, setSessions] = useState<DateSessions[]>([]);
    const [currentSessionFile, setCurrentSessionFile] = useState<string>();
    const [currentSessionData, setCurrentSessionData] = useState<ChatEntry[]>();

    useEffect(() => {
        if (currentSessionFile) {
            window.api.getCurrentSessionData(currentSessionFile).then((data) => setCurrentSessionData(data));
        }
    }, [currentSessionFile]);

    useEffect(() => {
        window.api.getSessions().then(setSessions);
    }, []);

    return (
        <SidebarProvider>
          <AppSidebar sessions={sessions} currentSessionFile={currentSessionFile} setCurrentSessionFile={setCurrentSessionFile} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b">
              <div className="flex items-center gap-2 px-3">
                <SidebarTrigger />
                <p className="text-lg font-semibold">{currentSessionData ? currentSessionData[0].timestamp : 'No session selected'}</p>
                <ModeToggle />
              </div>
            </header>
            <Card>
                <CardHeader>Current Session	</CardHeader>
                <CardContent>
                    <pre>{JSON.stringify(currentSessionData, null, 2)}</pre>
                </CardContent>
            </Card>
          </SidebarInset>
        </SidebarProvider>
      )
}