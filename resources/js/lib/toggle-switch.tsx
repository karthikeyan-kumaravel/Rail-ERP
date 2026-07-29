type ToggleSwitchProps = {
    id?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
};

/**
 * A Yes/No switch used in place of a plain checkbox for prominent boolean
 * toggles. A real `<button>` so it's keyboard-operable without any custom
 * key handling, and the Yes/No text is always shown alongside the knob so
 * the state isn't color-only.
 */
export default function ToggleSwitch({
    id,
    checked,
    onChange,
    disabled = false,
    'aria-label': ariaLabel,
}: ToggleSwitchProps) {
    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <span
                className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors ${
                    checked
                        ? 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-gold)]/30'
                }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
            </span>
            <span
                className={`text-xs font-semibold ${
                    checked
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-ink)]/55'
                }`}
            >
                {checked ? 'Yes' : 'No'}
            </span>
        </button>
    );
}
