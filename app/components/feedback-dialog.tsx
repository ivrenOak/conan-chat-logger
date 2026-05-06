import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import {
    ExternalLink,
    MessageSquareHeartIcon,
    MessagesSquare,
} from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';

const DISCORD_INVITE_URL = 'https://discord.gg/GkzYNKvjPJ';

export function FeedbackDialog() {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-4 text-lg font-semibold">
                    <MessageSquareHeartIcon />
                    Feedback &amp; Help
                </DialogTitle>
                <DialogDescription className="sr-only">
                    How to send feedback and reach the developer on Discord.
                </DialogDescription>
            </DialogHeader>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Bug reports, feature ideas, and questions are all
                        welcome.
                    </CardTitle>
                    <CardDescription>
                        You don&apos;t need a specific reason to reach out. A
                        short note that you&apos;re using the app is meaningful
                        too. It&apos;s great to know that the app is being used.
                        <br />
                        <br />
                        For the quickest replies, join the project&apos;s
                        Discord
                    </CardDescription>
                </CardHeader>
            </Card>

            <Button
                asChild
                className=" w-full gap-2 bg-[#5865F2] text-white hover:bg-[#4752C4] dark:bg-[#5865F2] dark:hover:bg-[#4752C4]"
            >
                <a
                    href={DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <MessagesSquare className="size-4" />
                    Join Discord server
                    <ExternalLink className="size-4 opacity-80" />
                </a>
            </Button>
        </DialogContent>
    );
}
