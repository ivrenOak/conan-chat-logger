import { useEffect, useMemo, useState } from 'react';
import { Item, ItemGroup } from './ui/item';
import { ItemContent } from './ui/item';
import type { ChatEntry } from 'src/handleMessage';
import { Settings } from 'src/settings';

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

type MessageSegment = {
    text: string;
    isEmote: boolean;
};

type StyledMessageSegment = MessageSegment & {
    isParenthetical: boolean;
};

function highlightText(text: string, query: string) {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, i) =>
        regex.test(part) ? (
            <mark key={i} style={{ backgroundColor: 'yellow' }}>
                {part}
            </mark>
        ) : (
            part
        ),
    );
}

function splitMessage(
    text: string,
    splitPattern: RegExp,
    isEmote: (part: string) => boolean,
): MessageSegment[] {
    const parts = text.split(splitPattern);
    return parts
        .filter((part) => part.length > 0)
        .map((part) => ({
            text: part,
            isEmote: isEmote(part),
        }));
}

function splitParentheticalSegments(text: string): StyledMessageSegment[] {
    const parentheticalPattern = /(\([^)]*(?:\)|$))/g;
    const parentheticalWholePattern = /^\([^)]*(?:\)|$)$/;

    return text
        .split(parentheticalPattern)
        .filter((part) => part.length > 0)
        .map((part) => ({
            text: part,
            isEmote: false,
            isParenthetical: parentheticalWholePattern.test(part),
        }));
}

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
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
    }

    return [Math.floor(r * 256), Math.floor(g * 256), Math.floor(b * 256)];
}

function splitMessageByEmoteType(
    message: string,
    emoteType: Settings['emoteType'],
): MessageSegment[] {
    if (emoteType === 'noFormating') {
        return [{ text: message, isEmote: false }];
    }

    if (emoteType === 'quoteExclude') {
        return splitMessage(
            message,
            /("[^"]*(?:"|$))/g,
            (part) => !/^"[^"]*(?:"|$)$/.test(part),
        );
    }

    if (emoteType === 'asteriskExclude') {
        return splitMessage(
            message,
            /(\*[^*]*(?:\*|$))/g,
            (part) => !/^\*[^*]*(?:\*|$)$/.test(part),
        );
    }

    if (emoteType === 'lessMoreInclude') {
        return splitMessage(message, /(<[^>]*(?:>|$))/g, (part) =>
            /^<[^>]*(?:>|$)$/.test(part),
        );
    }

    if (emoteType === 'asteriskInclude') {
        return splitMessage(message, /(\*[^*]*(?:\*|$))/g, (part) =>
            /^\*[^*]*(?:\*|$)$/.test(part),
        );
    }

    return [{ text: message, isEmote: false }];
}

type MessageItemProps = {
    entries?: ChatEntry[];
    search?: string;
    showNumbers?: boolean;
    emoteType?: Settings['emoteType'];
    sayColor?: string;
    emoteColor?: string;
    oocColor?: string;
};

export function MessageItem({
    entries = [],
    search = '',
    showNumbers = false,
    emoteType = 'noFormating',
    sayColor,
    emoteColor,
    oocColor,
}: MessageItemProps) {
    const [locale, setLocale] = useState('');

    useEffect(() => {
        window.api.getLocale().then((value) => {
            setLocale(value ?? 'en-US');
        });
    }, []);

    const senderColor = useMemo(() => {
        const nextSenderColor: Record<string, string> = {};
        const uniqueSenders = [
            ...new Set(entries.map((entry) => entry.sender)),
        ];
        let h = 1;

        uniqueSenders.forEach((sender) => {
            h = (h + GOLDEN_RATIO_CONJUGATE) % 1;
            const [r, g, b] = hsvToRgb(h, 0.4, 0.99);
            nextSenderColor[sender] = `rgb(${r} ${g} ${b} / 0.35)`;
        });

        return nextSenderColor;
    }, [entries]);

    if (!locale) return;

    return (
        <ItemGroup className="max-w-3xl overflow-y-auto">
            {entries.map((child, index) => (
                <div key={`message-${index}`} className="flex items-center">
                    {showNumbers && (
                        <p
                            key={`number-${index}`}
                            className="text-sm text-muted-foreground mr-2"
                        >
                            {index + 1}.
                        </p>
                    )}
                    <Item
                        key={child.timestamp}
                        variant="outline"
                        style={{ backgroundColor: senderColor[child.sender] }}
                    >
                        <ItemContent>
                            <p className="text-sm text-muted-foreground">
                                {new Date(child.timestamp).toLocaleTimeString(
                                    locale,
                                    { hour: '2-digit', minute: '2-digit' },
                                )}{' '}
                                {child.sender}
                            </p>
                            <p className="text-sm whitespace-pre-wrap break-words">
                                {splitParentheticalSegments(child.message)
                                    .flatMap((parentheticalSegment) =>
                                        parentheticalSegment.isParenthetical
                                            ? [parentheticalSegment]
                                            : splitMessageByEmoteType(
                                                  parentheticalSegment.text,
                                                  emoteType,
                                              ).map((segment) => ({
                                                  ...segment,
                                                  isParenthetical: false,
                                              })),
                                    )
                                    .map((segment, segmentIndex) => (
                                        <span
                                            key={`${child.timestamp}-${segmentIndex}`}
                                            style={{
                                                color: segment.isParenthetical
                                                    ? oocColor
                                                    : segment.isEmote
                                                      ? emoteColor
                                                      : sayColor,
                                            }}
                                        >
                                            {highlightText(
                                                segment.text,
                                                search,
                                            )}
                                        </span>
                                    ))}
                            </p>
                        </ItemContent>
                    </Item>
                </div>
            ))}
        </ItemGroup>
    );
}
