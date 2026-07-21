import type { ReactNode } from 'react';

type ToolbarActionButtonProps = {
    color: string;
    children: ReactNode;
    disabled?: boolean;
    href?: string;
    onClick?: () => void;
};

const baseClass =
    'relative flex shrink-0 items-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)]/80 shadow-sm transition hover:-translate-y-0.5 hover:text-[var(--color-ink)] hover:shadow-md disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40 disabled:shadow-sm';

/**
 * A small "stat card"-styled action button (white surface, colored top
 * accent stripe, soft shadow) used for the Copy/CSV/Print/Import/Template
 * toolbar row on every list page — see resources/js/lib/export-toolbar.tsx
 * and resources/js/lib/settings-import-actions.tsx. Renders as an `<a>` when
 * `href` is given, otherwise a `<button>`.
 */
export default function ToolbarActionButton({
    color,
    children,
    disabled,
    href,
    onClick,
}: ToolbarActionButtonProps) {
    const accentBar = (
        <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ backgroundColor: color }}
        />
    );

    if (href) {
        return (
            <a href={href} className={baseClass}>
                {accentBar}
                {children}
            </a>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={baseClass}
        >
            {accentBar}
            {children}
        </button>
    );
}
