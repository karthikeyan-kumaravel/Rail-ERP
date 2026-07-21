import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    ChevronDownIcon,
    getIconLabel,
    ICON_CATEGORIES,
    IconChip,
} from '@/lib/icons';
import type { IconKey } from '@/lib/icons';

type IconPickerProps = {
    id?: string;
    value: string;
    onChange: (value: IconKey) => void;
    placeholder?: string;
};

function matchesSearch(label: string, key: string, query: string): boolean {
    const needle = query.trim().toLowerCase();

    if (!needle) {
        return true;
    }

    return (
        label.toLowerCase().includes(needle) || key.toLowerCase().includes(needle)
    );
}

export default function IconPicker({
    id,
    value,
    onChange,
    placeholder = 'Search icons…',
}: IconPickerProps) {
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

    const filteredCategories = useMemo(() => {
        return ICON_CATEGORIES.map((category) => ({
            ...category,
            icons: category.icons.filter((key) =>
                matchesSearch(getIconLabel(key), key, query),
            ),
        })).filter((category) => category.icons.length > 0);
    }, [query]);

    const resultCount = filteredCategories.reduce(
        (total, category) => total + category.icons.length,
        0,
    );

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
                width: Math.max(rect.width, 420),
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

    const selectIcon = (key: IconKey) => {
        onChange(key);
        closePanel();
    };

    return (
        <div className="relative w-full">
            <button
                ref={buttonRef}
                id={id}
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center gap-2.5 rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
            >
                {value ? (
                    <IconChip
                        name={value}
                        className="h-7 w-7"
                        iconClassName="h-4 w-4"
                    />
                ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--color-ink)]/25" />
                )}
                <span className="flex-1 truncate text-left">
                    {value ? getIconLabel(value) : placeholder}
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
                        aria-label="Select an icon"
                        style={{
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                        }}
                        className="fixed z-50 flex max-h-[26rem] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_45px_rgba(15,36,54,0.22)]"
                    >
                        <div className="border-b border-[var(--color-border)] p-2.5">
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search icons by name…"
                                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/40 outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-2.5">
                            {resultCount === 0 && (
                                <p className="px-2 py-6 text-center text-sm text-[var(--color-ink)]/50">
                                    No icons match “{query}”.
                                </p>
                            )}

                            {filteredCategories.map((category) => (
                                <div key={category.label} className="mb-3 last:mb-0">
                                    <p className="mb-1.5 px-1 text-[10.5px] font-bold tracking-wider text-[var(--color-ink)]/45 uppercase">
                                        {category.label}
                                    </p>
                                    <div className="grid grid-cols-2 gap-1">
                                        {category.icons.map((key) => {
                                            const active = value === key;

                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => selectIcon(key)}
                                                    aria-pressed={active}
                                                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition ${
                                                        active
                                                            ? 'bg-[var(--color-accent)]/15 text-[var(--color-ink)] ring-1 ring-[var(--color-accent)]/50'
                                                            : 'text-[var(--color-ink)]/75 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)]'
                                                    }`}
                                                >
                                                    <IconChip
                                                        name={key}
                                                        className="h-6 w-6"
                                                        iconClassName="h-3.5 w-3.5"
                                                    />
                                                    <span className="truncate">
                                                        {getIconLabel(key)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
