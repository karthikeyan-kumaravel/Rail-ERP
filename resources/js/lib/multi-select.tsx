import { useState } from 'react';

type MultiSelectSearchProps = {
    id?: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
};

export default function MultiSelectSearch({
    id,
    options,
    selected,
    onChange,
    placeholder = 'Search...',
}: MultiSelectSearchProps) {
    const [search, setSearch] = useState('');

    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(search.toLowerCase()),
    );

    const toggle = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter((value) => value !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const remove = (option: string) => {
        onChange(selected.filter((value) => value !== option));
    };

    return (
        <div>
            {selected.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                    {selected.map((option) => (
                        <span
                            key={option}
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)]/15 px-2.5 py-1 text-xs font-medium text-[var(--color-ink)]"
                        >
                            {option}
                            <button
                                type="button"
                                onClick={() => remove(option)}
                                aria-label={`Remove ${option}`}
                                className="text-[var(--color-ink)]/50 hover:text-[var(--color-accent)]"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <input
                id={id}
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={placeholder}
                className="mb-2 w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
            />

            <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] p-2">
                {filteredOptions.length === 0 && (
                    <p className="px-2 py-1 text-xs text-[var(--color-ink)]/50">
                        No matches found.
                    </p>
                )}
                {filteredOptions.map((option) => (
                    <label
                        key={option}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10"
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(option)}
                            onChange={() => toggle(option)}
                            className="h-4 w-4 rounded border-[var(--color-gold)]/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)]/40"
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>
    );
}
