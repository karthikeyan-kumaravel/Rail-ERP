import type { ComponentType, ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    CheckIcon,
    LayoutTopIcon,
    MonitorIcon,
    MoonIcon,
    RefreshIcon,
    SettingsIcon,
    SidebarIcon,
    SparklesIcon,
    SquareIcon,
    SunIcon,
    TypeIcon,
} from '@/lib/icons';
import type { IconProps } from '@/lib/icons';
import { usePreferences } from '@/lib/use-preferences';
import type {
    AccentColor,
    BackgroundStyle,
    BorderRadius,
    FontSize,
    GradientPreset,
    HeaderStyle,
    SidebarStyle,
    ThemeMode,
} from '@/lib/use-preferences';

const ACCENT_SWATCHES: { value: AccentColor; label: string; hex: string }[] = [
    { value: 'orange', label: 'Orange', hex: '#f2905c' },
    { value: 'blue', label: 'Blue', hex: '#4f8ef7' },
    { value: 'green', label: 'Green', hex: '#34b374' },
    { value: 'purple', label: 'Purple', hex: '#9b6bf2' },
    { value: 'red', label: 'Red', hex: '#ef5b5b' },
];

const GRADIENT_SWATCHES: {
    value: GradientPreset;
    label: string;
    from: string;
    to: string;
}[] = [
    { value: 'orange', label: 'Orange', from: '#f2905c', to: '#c9a227' },
    { value: 'blue', label: 'Blue', from: '#4f8ef7', to: '#2f6fed' },
    { value: 'green', label: 'Green', from: '#3fd08a', to: '#1f8f5c' },
    { value: 'purple', label: 'Purple', from: '#a97bff', to: '#7c4fd1' },
    { value: 'red', label: 'Red', from: '#ff7b7b', to: '#d93f3f' },
    { value: 'sunset', label: 'Sunset', from: '#ff9a5c', to: '#ff5c8a' },
    { value: 'ocean', label: 'Ocean', from: '#3fd0ff', to: '#2f6fed' },
    { value: 'forest', label: 'Forest', from: '#8ad13f', to: '#1f8f5c' },
    { value: 'midnight', label: 'Midnight', from: '#6b7bff', to: '#1b1f3b' },
];

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="border-t border-[var(--color-border)]/60 px-4 py-3.5 first:border-t-0">
            <p className="mb-2.5 text-xs font-bold tracking-wider text-[var(--color-ink)]/50 uppercase">
                {title}
            </p>
            {children}
        </div>
    );
}

type SegmentedOption<T extends string> = {
    value: T;
    label: string;
    icon?: ComponentType<IconProps>;
};

function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    columns,
}: {
    options: SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    columns?: number;
}) {
    return (
        <div
            className="grid gap-1.5"
            style={{
                gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))`,
            }}
        >
            {options.map((option) => {
                const Icon = option.icon;
                const active = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(option.value)}
                        className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                            active
                                ? 'border-transparent bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-md'
                                : 'border-[var(--color-border)] text-[var(--color-ink)]/70 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)]'
                        }`}
                    >
                        {Icon && <Icon className="h-4 w-4" />}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

function ToggleSwitch({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="flex w-full items-center justify-between gap-3"
        >
            <span className="text-sm font-medium text-[var(--color-ink)]/85">
                {label}
            </span>
            <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    checked
                        ? 'bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)]'
                        : 'bg-[var(--color-border)]'
                }`}
            >
                <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        checked ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                />
            </span>
        </button>
    );
}

const THEME_OPTIONS: SegmentedOption<ThemeMode>[] = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: MonitorIcon },
];

const BACKGROUND_OPTIONS: SegmentedOption<BackgroundStyle>[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'glass', label: 'Glass' },
];

const SIDEBAR_OPTIONS: SegmentedOption<SidebarStyle>[] = [
    { value: 'expanded', label: 'Expanded', icon: SidebarIcon },
    { value: 'compact', label: 'Compact', icon: SidebarIcon },
];

const HEADER_OPTIONS: SegmentedOption<HeaderStyle>[] = [
    { value: 'static', label: 'Static', icon: LayoutTopIcon },
    { value: 'sticky', label: 'Sticky', icon: LayoutTopIcon },
];

const FONT_SIZE_OPTIONS: { value: FontSize; label: string; sample: string }[] =
    [
        { value: 'small', label: 'Small', sample: 'text-xs' },
        { value: 'medium', label: 'Medium', sample: 'text-sm' },
        { value: 'large', label: 'Large', sample: 'text-base' },
    ];

const RADIUS_OPTIONS: { value: BorderRadius; label: string; className: string }[] =
    [
        { value: 'small', label: 'Small', className: 'rounded-xs' },
        { value: 'medium', label: 'Medium', className: 'rounded-lg' },
        { value: 'large', label: 'Large', className: 'rounded-2xl' },
    ];

function AppearancePreview() {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-3">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-[var(--color-ink)]">
                            Preview card
                        </p>
                        <p className="text-xs text-[var(--color-ink)]/55">
                            Live, updates as you choose
                        </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-[var(--color-status-gold-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--color-status-gold-text)]">
                        Active
                    </span>
                </div>
                <button
                    type="button"
                    tabIndex={-1}
                    className="mt-3 w-full rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] py-2 text-sm font-semibold text-white shadow-md"
                >
                    Sample button
                </button>
            </div>
        </div>
    );
}

export default function AppearancePanel() {
    const { preferences, updatePreference, resetPreferences } =
        usePreferences();
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; right: number } | null>(
        null,
    );
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

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
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        };

        updateCoords();

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                !buttonRef.current?.contains(target) &&
                !panelRef.current?.contains(target)
            ) {
                setOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        // The panel is portaled to <body> with `position: fixed`, so if the
        // trigger's scroll container moves, re-anchor rather than leaving it
        // floating in the wrong place.
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
    }, [open]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                title="Preferences"
                aria-label="Open appearance preferences"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={panelId}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-gold)]/80 transition hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40 focus-visible:outline-none"
            >
                <SettingsIcon className="h-5 w-5" />
            </button>

            {open &&
                coords &&
                createPortal(
                    <div
                        id={panelId}
                        ref={panelRef}
                        role="dialog"
                        aria-label="Appearance preferences"
                        style={{ top: coords.top, right: coords.right }}
                        className="fixed z-50 max-h-[85vh] w-96 origin-top-right overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_45px_rgba(15,36,54,0.22)]"
                    >
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                        <p className="text-sm font-bold text-[var(--color-ink)]">
                            Appearance
                        </p>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close appearance preferences"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink)]/45 transition hover:bg-red-50 hover:text-red-500"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <path d="m6 6 12 12M18 6 6 18" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-4 py-3.5">
                        <AppearancePreview />
                    </div>

                    <Section title="Theme">
                        <SegmentedControl
                            options={THEME_OPTIONS}
                            value={preferences.theme}
                            onChange={(value) =>
                                updatePreference('theme', value)
                            }
                        />
                    </Section>

                    <Section title="Accent Color">
                        <div className="flex items-center gap-2.5">
                            {ACCENT_SWATCHES.map((swatch) => {
                                const active =
                                    preferences.accent === swatch.value;

                                return (
                                    <button
                                        key={swatch.value}
                                        type="button"
                                        title={swatch.label}
                                        aria-label={swatch.label}
                                        aria-pressed={active}
                                        onClick={() =>
                                            updatePreference(
                                                'accent',
                                                swatch.value,
                                            )
                                        }
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 transition ${
                                            active
                                                ? 'ring-[var(--color-ink)]/70'
                                                : 'ring-transparent hover:ring-[var(--color-ink)]/25'
                                        }`}
                                        style={{
                                            backgroundColor: swatch.hex,
                                        }}
                                    >
                                        {active && (
                                            <CheckIcon className="h-4 w-4 text-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    <Section title="Background Style">
                        <SegmentedControl
                            options={BACKGROUND_OPTIONS}
                            value={preferences.backgroundStyle}
                            onChange={(value) =>
                                updatePreference('backgroundStyle', value)
                            }
                        />
                    </Section>

                    <Section title="Gradient Preset">
                        <div className="grid grid-cols-5 gap-2">
                            {GRADIENT_SWATCHES.map((swatch) => {
                                const active =
                                    preferences.gradientPreset ===
                                    swatch.value;

                                return (
                                    <button
                                        key={swatch.value}
                                        type="button"
                                        title={swatch.label}
                                        aria-label={swatch.label}
                                        aria-pressed={active}
                                        onClick={() =>
                                            updatePreference(
                                                'gradientPreset',
                                                swatch.value,
                                            )
                                        }
                                        className={`h-8 rounded-lg ring-2 transition ${
                                            active
                                                ? 'ring-[var(--color-ink)]/70'
                                                : 'ring-transparent hover:ring-[var(--color-ink)]/25'
                                        }`}
                                        style={{
                                            backgroundImage: `linear-gradient(135deg, ${swatch.from}, ${swatch.to})`,
                                        }}
                                    />
                                );
                            })}
                            <button
                                type="button"
                                title="Custom Gradient"
                                aria-label="Custom Gradient"
                                aria-pressed={
                                    preferences.gradientPreset === 'custom'
                                }
                                onClick={() =>
                                    updatePreference('gradientPreset', 'custom')
                                }
                                className={`flex h-8 items-center justify-center rounded-lg ring-2 transition ${
                                    preferences.gradientPreset === 'custom'
                                        ? 'ring-[var(--color-ink)]/70'
                                        : 'ring-transparent hover:ring-[var(--color-ink)]/25'
                                }`}
                                style={{
                                    backgroundImage: `linear-gradient(135deg, ${preferences.customGradient.from}, ${preferences.customGradient.to})`,
                                }}
                            >
                                <SparklesIcon className="h-4 w-4 text-white" />
                            </button>
                        </div>

                        {preferences.gradientPreset === 'custom' && (
                            <div className="mt-2.5 flex items-center gap-3 rounded-lg bg-[var(--color-surface-soft)] p-2.5">
                                <label className="flex flex-1 items-center gap-2 text-xs font-medium text-[var(--color-ink)]/70">
                                    From
                                    <input
                                        type="color"
                                        value={preferences.customGradient.from}
                                        onChange={(event) =>
                                            updatePreference(
                                                'customGradient',
                                                {
                                                    ...preferences.customGradient,
                                                    from: event.target.value,
                                                },
                                            )
                                        }
                                        className="h-7 w-full cursor-pointer rounded border border-[var(--color-border)]"
                                    />
                                </label>
                                <label className="flex flex-1 items-center gap-2 text-xs font-medium text-[var(--color-ink)]/70">
                                    To
                                    <input
                                        type="color"
                                        value={preferences.customGradient.to}
                                        onChange={(event) =>
                                            updatePreference(
                                                'customGradient',
                                                {
                                                    ...preferences.customGradient,
                                                    to: event.target.value,
                                                },
                                            )
                                        }
                                        className="h-7 w-full cursor-pointer rounded border border-[var(--color-border)]"
                                    />
                                </label>
                            </div>
                        )}
                    </Section>

                    <Section title="Sidebar Style">
                        <SegmentedControl
                            options={SIDEBAR_OPTIONS}
                            value={preferences.sidebarStyle}
                            onChange={(value) =>
                                updatePreference('sidebarStyle', value)
                            }
                        />
                    </Section>

                    <Section title="Header Style">
                        <SegmentedControl
                            options={HEADER_OPTIONS}
                            value={preferences.headerStyle}
                            onChange={(value) =>
                                updatePreference('headerStyle', value)
                            }
                        />
                    </Section>

                    <Section title="Font Size">
                        <div className="grid grid-cols-3 gap-1.5">
                            {FONT_SIZE_OPTIONS.map((option) => {
                                const active =
                                    preferences.fontSize === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() =>
                                            updatePreference(
                                                'fontSize',
                                                option.value,
                                            )
                                        }
                                        className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                                            active
                                                ? 'border-transparent bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-md'
                                                : 'border-[var(--color-border)] text-[var(--color-ink)]/70 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)]'
                                        }`}
                                    >
                                        <TypeIcon className={option.sample} />
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    <Section title="Border Radius">
                        <div className="grid grid-cols-3 gap-1.5">
                            {RADIUS_OPTIONS.map((option) => {
                                const active =
                                    preferences.borderRadius === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() =>
                                            updatePreference(
                                                'borderRadius',
                                                option.value,
                                            )
                                        }
                                        className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                                            active
                                                ? 'border-transparent bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-md'
                                                : 'border-[var(--color-border)] text-[var(--color-ink)]/70 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)]'
                                        }`}
                                    >
                                        <SquareIcon
                                            className={`h-4 w-4 ${option.className}`}
                                        />
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    <Section title="Motion">
                        <ToggleSwitch
                            checked={preferences.animations}
                            onChange={(value) =>
                                updatePreference('animations', value)
                            }
                            label="Enable UI animations"
                        />
                    </Section>

                    <div className="border-t border-[var(--color-border)] px-4 py-3.5">
                        <button
                            type="button"
                            onClick={resetPreferences}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] py-2 text-sm font-semibold text-[var(--color-ink)]/75 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                        >
                            <RefreshIcon className="h-4 w-4" />
                            Reset to Default
                        </button>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}
