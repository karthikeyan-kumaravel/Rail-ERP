import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@/lib/icons';
import { search } from '@/routes/admin/engineers';

export type EngineerSearchResult = {
    id: number;
    employee_code: string;
    full_name: string;
    engineer_type_id: number | null;
    engineer_type: string | null;
};

type EngineerComboboxProps = {
    id?: string;
    value: number | '';
    /** The currently selected engineer's full name, shown when closed. */
    displayLabel: string;
    onSelect: (engineer: EngineerSearchResult) => void;
    placeholder?: string;
    disabled?: boolean;
};

/**
 * Searchable Engineer picker for the LOA Project Team tab — queries
 * `admin.engineers.search` server-side as the user types (debounced) rather
 * than filtering a preloaded list, since Engineer Master can be large. Follows
 * the same portal/popover recipe as `SearchableSelect`, but each result row
 * shows "Employee ID | Engineer Name | Engineer Type" instead of a plain name.
 */
export default function EngineerCombobox({
    id,
    value,
    displayLabel,
    onSelect,
    placeholder = 'Search by name or employee ID…',
    disabled = false,
}: EngineerComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<EngineerSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState<{
        top: number;
        left: number;
        width: number;
    } | null>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const panelId = useId();

    const closePanel = useCallback(() => {
        setOpen(false);
        setQuery('');
        setResults([]);
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

    useEffect(() => {
        if (!open) {
            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            setLoading(true);

            fetch(search.url({ query: { search: query } }), {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
                signal: controller.signal,
            })
                .then((response) => response.json())
                .then((body: { engineers: EngineerSearchResult[] }) => {
                    setResults(body.engineers);
                    setLoading(false);
                })
                .catch((error: unknown) => {
                    if (!(
                        error instanceof DOMException &&
                        error.name === 'AbortError'
                    )) {
                        setLoading(false);
                    }
                });
        }, 300);

        return () => {
            controller.abort();
            window.clearTimeout(timeout);
        };
    }, [open, query]);

    const selectOption = (engineer: EngineerSearchResult) => {
        onSelect(engineer);
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
                    className={`flex-1 truncate text-left ${value !== '' ? '' : 'text-[var(--color-ink)]/35'}`}
                >
                    {value !== '' && displayLabel ? displayLabel : placeholder}
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
                        aria-label="Select an engineer"
                        style={{
                            top: coords.top,
                            left: coords.left,
                            width: Math.max(coords.width, 340),
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
                                placeholder="Search by employee ID or name…"
                                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/40 outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-1.5">
                            {loading && (
                                <p className="px-2 py-6 text-center text-sm text-[var(--color-ink)]/50">
                                    Searching…
                                </p>
                            )}

                            {!loading && results.length === 0 && (
                                <p className="px-2 py-6 text-center text-sm text-[var(--color-ink)]/50">
                                    No engineers found.
                                </p>
                            )}

                            {!loading &&
                                results.map((engineer) => {
                                    const active = engineer.id === value;

                                    return (
                                        <button
                                            key={engineer.id}
                                            type="button"
                                            onClick={() =>
                                                selectOption(engineer)
                                            }
                                            aria-pressed={active}
                                            className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                                                active
                                                    ? 'bg-[var(--color-accent)]/15 text-[var(--color-ink)] ring-1 ring-[var(--color-accent)]/50'
                                                    : 'text-[var(--color-ink)]/75 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)]'
                                            }`}
                                        >
                                            <span className="block truncate">
                                                {engineer.employee_code} |{' '}
                                                {engineer.full_name} |{' '}
                                                {engineer.engineer_type ?? '—'}
                                            </span>
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
