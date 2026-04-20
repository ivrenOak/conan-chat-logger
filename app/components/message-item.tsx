import { useEffect, useMemo, useState } from "react";
import { Item, ItemGroup } from "./ui/item";
import { ItemContent } from "./ui/item";
import type { ChatEntry } from "src/handleMessage";

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const hIndex = Math.floor(h * 6);
    const f = h * 6 - hIndex;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r = v;
    let g = t;
    let b = p;

    switch (hIndex % 6) {
        case 0:
            r = v; g = t; b = p;
            break;
        case 1:
            r = q; g = v; b = p;
            break;
        case 2:
            r = p; g = v; b = t;
            break;
        case 3:
            r = p; g = q; b = v;
            break;
        case 4:
            r = t; g = p; b = v;
            break;
        case 5:
            r = v; g = p; b = q;
            break;
    }

    return [Math.floor(r * 256), Math.floor(g * 256), Math.floor(b * 256)];
}

type MessageItemProps = {
    entries?: ChatEntry[];
};

export function MessageItem({ entries = [] }: MessageItemProps) {

    const [locale, setLocale] = useState("");

    useEffect(() => {
        window.api.getLocale().then((value) => {
          setLocale(value ?? "en-US");
        });
    }, []);

    const senderColor = useMemo(() => {
        const nextSenderColor: Record<string, string> = {};
        const uniqueSenders = [...new Set(entries.map((entry) => entry.sender))];
        let h = 1;

        uniqueSenders.forEach((sender) => {
            h = (h + GOLDEN_RATIO_CONJUGATE) % 1;
            const [r, g, b] = hsvToRgb(h, 0.4, 0.99);
            nextSenderColor[sender] = `rgb(${r} ${g} ${b} / 0.35)`;
        });

        return nextSenderColor;
    }, [entries]);

    return (
        <ItemGroup className="max-w-3xl mx-auto overflow-y-auto">
            {entries.map((child) => (
                <Item
                    key={child.timestamp}
                    variant="outline"
                    style={{ backgroundColor: senderColor[child.sender] }}
                >
                    <ItemContent>
                        <p className="text-sm text-muted-foreground">
                            {new Date(child.timestamp).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}{" "}
                            {child.sender}
                        </p>
                        <p className="text-sm whitespace-pre-wrap break-words">{child.message}</p>
                    </ItemContent>
                </Item>
            ))}
        </ItemGroup>
    )
}