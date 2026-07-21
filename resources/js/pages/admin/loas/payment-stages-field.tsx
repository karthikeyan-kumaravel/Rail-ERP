import { useState } from 'react';
import {
    PAYMENT_STAGE_KEYS,
    PAYMENT_STAGE_SHORT_LABELS,
    PAYMENT_STAGE_TONE_CLASS,
} from './loa-form-fields';
import type { PaymentStages } from './loa-form-fields';
import PaymentStagesModal from './payment-stages-modal';

type PaymentStagesFieldProps = {
    value: PaymentStages | null;
    onChange: (stages: PaymentStages) => void;
    disabled?: boolean;
};

/**
 * The Payment Type column's "Payment / Configure" trigger plus the compact
 * colored pattern bar shown once stages are saved. Reused by both the
 * manual-add form and the item table's edit-row cell.
 */
export default function PaymentStagesField({
    value,
    onChange,
    disabled = false,
}: PaymentStagesFieldProps) {
    const [isOpen, setIsOpen] = useState(false);
    const configuredKeys = PAYMENT_STAGE_KEYS.filter((key) => value?.[key]);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {configuredKeys.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/60 px-2.5 py-1.5">
                    <span className="text-[0.65rem] font-bold tracking-wide whitespace-nowrap text-[var(--color-ink)]/45">
                        {configuredKeys
                            .map((key) => (value?.[key] ?? '').replace('%', ''))
                            .join('-')}
                    </span>
                    {configuredKeys.map((key) => (
                        <span
                            key={key}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap ${PAYMENT_STAGE_TONE_CLASS[key]}`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {PAYMENT_STAGE_SHORT_LABELS[key]} {value?.[key]}
                        </span>
                    ))}
                </div>
            )}

            {disabled && configuredKeys.length === 0 && (
                <span className="text-[var(--color-ink)]/55">—</span>
            )}

            {!disabled && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="rounded-md border border-[var(--color-gold)]/30 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-[var(--color-ink)]/75 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                >
                    {configuredKeys.length > 0 ? 'Edit' : 'Payment / Configure'}
                </button>
            )}

            {isOpen && (
                <PaymentStagesModal
                    initialStages={value}
                    onSave={(stages) => {
                        onChange(stages);
                        setIsOpen(false);
                    }}
                    onCancel={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
