import * as React from 'react';
import { XIcon } from 'lucide-react';
import type { ChatEntry } from 'src/handleMessage';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/combobox';

type ParticipantsPanelProps = {
    entries: ChatEntry[];
    selectedSenders: string[];
    onSelectedSendersChange: (senders: string[]) => void;
    onHide: () => void;
    selectedMentions: string[];
    onSelectedMentionsChange: (mentions: string[]) => void;
};

export function ParticipantsPanel({
    entries,
    selectedSenders,
    onSelectedSendersChange,
    onHide,
    selectedMentions,
    onSelectedMentionsChange,
}: ParticipantsPanelProps) {
    const anchor = useComboboxAnchor();
    const anchor2 = useComboboxAnchor();
    const participants = [...new Set(entries.map((entry) => entry.sender))];

    return (
        <div className="w-56 shrink-0 overflow-y-auto border-l py-2 px-4">
            <div className="flex items-start justify-between">
                <p className="py-1.5 text-sm text-muted-foreground">
                    Participants
                </p>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hide participants"
                    onClick={onHide}
                >
                    <XIcon className="text-muted-foreground" />
                </Button>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 py-2">
                {participants.map((sender) => (
                    <p key={sender} className="text-sm" title={sender}>
                        {sender}
                    </p>
                ))}
            </div>
            <Separator className="mb-2" />
            <Field className="text-muted-foreground">
                <FieldLabel>Filter emotes by sender</FieldLabel>
                <Combobox
                    multiple
                    autoHighlight
                    items={participants}
                    value={selectedSenders}
                    onValueChange={onSelectedSendersChange}
                >
                    <ComboboxChips ref={anchor} className="w-full">
                        <ComboboxValue>
                            {(values) => (
                                <React.Fragment>
                                    {values.map((value: string) => (
                                        <ComboboxChip key={value}>
                                            {value}
                                        </ComboboxChip>
                                    ))}
                                    <ComboboxChipsInput
                                        className="placeholder:text-muted-foreground"
                                        placeholder={
                                            selectedSenders.length === 0
                                                ? 'Add sender'
                                                : ''
                                        }
                                    />
                                </React.Fragment>
                            )}
                        </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent anchor={anchor}>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item) => (
                                <ComboboxItem key={item} value={item}>
                                    {item}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Field>
            <Field className="text-muted-foreground mt-5">
                <FieldLabel>Highlight mentions</FieldLabel>
                <Combobox
                    multiple
                    autoHighlight
                    items={participants}
                    value={selectedMentions}
                    onValueChange={onSelectedMentionsChange}
                >
                    <ComboboxChips ref={anchor2} className="w-full">
                        <ComboboxValue>
                            {(values) => (
                                <React.Fragment>
                                    {values.map((value: string) => (
                                        <ComboboxChip key={value}>
                                            {value}
                                        </ComboboxChip>
                                    ))}
                                    <ComboboxChipsInput
                                        className="placeholder:text-muted-foreground"
                                        placeholder={
                                            selectedMentions.length === 0
                                                ? 'Add participant'
                                                : ''
                                        }
                                    />
                                </React.Fragment>
                            )}
                        </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent anchor={anchor2}>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item) => (
                                <ComboboxItem key={item} value={item}>
                                    {item}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Field>
        </div>
    );
}
