import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@/lib/icons';

export type SearchableSelectOption = { id: number; name: string };

type SearchableSelectProps = {
    id?: string;
    value: number | '';
    options: SearchableSelectOption[];
    onChange: (value: number | '') => void;
    placeholder?: string;
    disabled?: boolean;
};

export default function SearchableSelect({
    id,
    value,
    options,
    onChange,
    placeholder = 'Search…',
    disabled = false,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [coords, setCoords] = useState<{
        top: number;
        left: number;
        width: number;
    } | null>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const panelId = useId();

    const selected = options.find((option) => option.id === value) ?? null;

    const filteredOptions = useMemo(() => {
        const needle = query.trim().toLowerCase();

        if (!needle) {
            return options;
        }

        return options.filter((option) =>
            option.name.toLowerCase().includes(needle),
        );
    }, [options, query]);

    const closePanel = useCallback(() => {
        setOpen(false);
        setQuery('');
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const updateCoords = () => {
            const rect = buttonRef.current?.getBoundingClientRect();

            if (!rect) {
                return;
            }

            setCoords({
                top: rect.bottom + 6,
                left: rect.left,
                width: rect.width,
            });
        };

        updateCoords();
        searchRef.current?.focus();

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                !buttonRef.current?.contains(target) &&
                !panelRef.current?.contains(target)
            ) {
                closePanel();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closePanel();
            }
        };

        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('keydown', handleEscape);
        window.addEventListener('resize', updateCoords);
        window.addEventListener('scroll', updateCoords, true);

        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleEscape);
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords, true);
        };
    }, [open, closePanel]);

    const selectOption = (option: SearchableSelectOption) => {
        onChange(option.id);
        closePanel();
    };

    return (
        <div className="relative w-full">
            <button
                ref={buttonRef}
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => setOpen((current) => !current)}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center gap-2.5 rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span
                    className={`flex-1 truncate text-left ${selected ? '' : 'text-[var(--color-ink)]/35'}`}
                >
                    {selected ? selected.name : placeholder}
                </span>
                <ChevronDownIcon
                    className={`h-4 w-4 shrink-0 text-[var(--color-ink)]/50 transition-transform ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open &&
                coords &&
                createPortal(
                    <div
                        id={panelId}
                        ref={panelRef}
                        role="dialog"
                        aria-label={placeholder}
                        style={{
                            top: coords.top,
                            left: coords.left,
                            width: Math.max(coords.width, 260),
                        }}
                        className="fixed z-50 flex max-h-72 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_45px_rgba(15,36,54,0.22)]"
                    >
                        <div className="border-b border-[var(--color-border)] p-2.5">
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Type to search…"
                                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/40 outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-1.5">
                            {filteredOptions.length === 0 && (
                                <p className="px-2 py-6 text-center text-sm text-[var(--color-ink)]/50">
                                    No matches found.
                                </p>
                            )}

                            {filteredOptions.map((option) => {
                                const active = option.id === value;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => selectOption(option)}
                                        aria-pressed={active}
                                        className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                                            active
                                                ? 'bg-[var(--color-accent)]/15 text-[var(--color-ink)] ring-1 ring-[var(--color-accent)]/50'
                                                : 'text-[var(--color-ink)]/75 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)]'
                                        }`}
                                    >
                                        {option.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
