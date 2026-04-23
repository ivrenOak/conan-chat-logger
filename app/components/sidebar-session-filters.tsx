import * as React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { DateSessions } from 'src/handler/handleSessions';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';
import { ButtonGroup } from './ui/button-group';
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
} from './ui/combobox';
import { Field, FieldLabel } from './ui/field';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';

type SidebarSessionFiltersProps = {
    sessions: DateSessions[];
    search: string;
    setSearch: (search: string) => void;
    setSessions: (sessions: DateSessions[]) => void;
    selectedSenders: string[];
    setSelectedSenders: (senders: string[]) => void;
    selectedDate: DateRange | undefined;
    setSelectedDate: (range: DateRange | undefined) => void;
    locale: string;
};

export function SidebarSessionFilters({
    sessions,
    search,
    setSearch,
    setSessions,
    selectedSenders,
    setSelectedSenders,
    selectedDate,
    setSelectedDate,
    locale,
}: SidebarSessionFiltersProps) {
    const anchor = useComboboxAnchor();

    return (
        <>
            <ButtonGroup className="px-2 py-1.5">
                <Input
                    placeholder="Search..."
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                    variant="outline"
                    aria-label="Search"
                    onClick={() =>
                        window.api
                            .filterSessionsBySearch(search)
                            .then(setSessions)
                    }
                >
                    <SearchIcon />
                </Button>
            </ButtonGroup>
            <Field className="px-2 py-1.5 text-muted-foreground">
                <FieldLabel>Filter by participants</FieldLabel>
                <Combobox
                    multiple
                    autoHighlight
                    items={[
                        ...new Set(
                            sessions.flatMap((dateSessions) =>
                                dateSessions.sessions.flatMap(
                                    (session) => session.senders,
                                ),
                            ),
                        ),
                    ]}
                    value={selectedSenders}
                    onValueChange={(value) => setSelectedSenders(value)}
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
                                                ? 'Add participant'
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
            <Field className="gap-1.5 px-2 py-1.5">
                <FieldLabel className="text-sm text-muted-foreground">
                    Filter by date
                </FieldLabel>
                <ButtonGroup className="w-full">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker-range"
                                className="h-9 w-full min-w-0 flex-1 justify-start px-2.5 font-normal"
                            >
                                {selectedDate?.from ? (
                                    selectedDate.to ? (
                                        <>
                                            {selectedDate.from.toLocaleDateString(
                                                locale,
                                            )}
                                            -{' '}
                                            {selectedDate.to.toLocaleDateString(
                                                locale,
                                            )}
                                        </>
                                    ) : (
                                        selectedDate.from.toLocaleDateString(
                                            locale,
                                        )
                                    )
                                ) : (
                                    <span className="text-muted-foreground">
                                        Pick a date
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                defaultMonth={selectedDate?.from}
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    {selectedDate ? (
                        <Button
                            variant="outline"
                            onClick={() => setSelectedDate(undefined)}
                            title="Clear date filter"
                            aria-label="Clear date filter"
                        >
                            <XIcon className="size-4 text-muted-foreground" />
                        </Button>
                    ) : null}
                </ButtonGroup>
            </Field>
        </>
    );
}
