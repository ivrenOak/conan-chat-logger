import * as React from "react"

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
} from "@/components/ui/sidebar"
import { H3 } from "./typography"
import { DateSessions } from "src/handler/handleSessions"

export function AppSidebar({ sessions, currentSessionFile, setCurrentSessionFile, ...props }: React.ComponentProps<typeof Sidebar> & { sessions: DateSessions[], currentSessionFile: string | undefined, setCurrentSessionFile: (filename: string) => void }) {

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-1.5">
              <H3>Sessions</H3>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sessions.map((item) => (
              <SidebarMenuItem key={item.date}>
                <div className="px-2 py-1.5">
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                {item.sessions.length > 0 ? (
                  <SidebarMenuSub>
                    {item.sessions.map((session: DateSessions["sessions"][number]) => (
                      <SidebarMenuSubItem key={session.filename}>
                        <SidebarMenuSubButton
                          isActive={currentSessionFile === session.filename}
                          onClick={() => setCurrentSessionFile(session.filename)}
                          title={session.senders.join(", ")}
                        >
                          <span className="block w-full truncate whitespace-nowrap">
                            {session.senders.join(", ")}
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
