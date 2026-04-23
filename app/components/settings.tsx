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
import { DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export function AppSettings() {
    return (
        <DialogContent className="h-[80vh] max-w-5xl overflow-hidden p-0">
            <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader>
                        <div className="px-2 py-1.5 text-sm font-semibold">
                            Settings
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Sections</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton isActive>
                                            General
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
                <SidebarInset className="overflow-hidden">
                    <header className="flex min-h-16 items-center gap-2 border-b px-3 py-2">
                        <p className="text-lg font-semibold">Settings</p>
                    </header>
                    <div className="flex-1 p-4" />
                </SidebarInset>
            </SidebarProvider>
        </DialogContent>
    );
}
