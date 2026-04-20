import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { useEffect, useState } from "react";
import type { DateSessions } from "src/handler/handleSessions";
import type { SessionData } from "src/handleMessage";
import { MessageItem } from "@/components/message-item";
import { TitleDialog } from "@/components/title-dialog";

export function ChatOverview() {
    const [sessions, setSessions] = useState<DateSessions[]>([]);
    const [currentSessionFile, setCurrentSessionFile] = useState<string>();
    const [currentSessionData, setCurrentSessionData] = useState<SessionData>();
    const currentEntries = currentSessionData?.entries ?? [];


    useEffect(() => {
        if (currentSessionFile) {
            window.api.getCurrentSessionData(currentSessionFile).then((data) => {
                setCurrentSessionData(data);
            });
        }
    }, [currentSessionFile]);

    useEffect(() => {
        window.api.getSessions().then(setSessions);
    }, []);


    return (
        <SidebarProvider>
          <AppSidebar sessions={sessions} currentSessionFile={currentSessionFile} setCurrentSessionFile={setCurrentSessionFile} />
          <SidebarInset>
            <header className="flex min-h-16 w-full shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
              <SidebarTrigger />
              <div className="flex min-w-0 items-start gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-lg font-semibold">
                    {currentSessionData?.session.title ? currentSessionData.session.title : "No session selected"}
                    {currentSessionData?.session.title && currentSessionFile && (
                      <TitleDialog
                        titleValue={currentSessionData.session.title}
                        setTitleValue={(value: string) =>
                          window.api
                            .setSessionTitle(currentSessionFile, value)
                            .then(() => window.api.getCurrentSessionData(currentSessionFile))
                            .then((data) => setCurrentSessionData(data))
                            .catch((error) => console.error(error))
                        }
                      />
                    )}                  </p>
                    <p
                      className="text-sm text-muted-foreground overflow-hidden"
                      title={currentEntries.length > 0 ? [...new Set(currentEntries.map((entry) => entry.sender))].join(', ') : undefined}
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {currentEntries.length > 0 && [...new Set(currentEntries.map((entry) => entry.sender))].join(', ')}
                    </p>
                </div>
              </div>
              <ModeToggle />
            </header>
            <div className="p-4">
              <MessageItem entries={currentEntries} />
            </div>
          </SidebarInset>
        </SidebarProvider>
      )
}