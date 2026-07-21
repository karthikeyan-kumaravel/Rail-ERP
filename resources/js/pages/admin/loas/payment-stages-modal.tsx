import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    inputClass,
    labelClass,
    PAYMENT_PERCENTAGE_OPTIONS,
    PAYMENT_STAGE_KEYS,
    sumPaymentStages,
} from './loa-form-fields';
import type { PaymentStageKey, PaymentStages } from './loa-form-fields';

type PaymentStagesModalProps = {
    initialStages: PaymentStages | null;
    onSave: (stages: PaymentStages) => void;
    onCancel: () => void;
};

const buttonClass =
    'rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
const primaryButtonClass = `${buttonClass} bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-lg hover:brightness-110`;
const secondaryButtonClass = `${buttonClass} border border-[var(--color-gold)]/30 text-[var(--color-ink)]/75 hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]`;

export default function PaymentStagesModal({
    initialStages,
    onSave,
    onCancel,
}: PaymentStagesModalProps) {
    const [stages, setStages] = useState<PaymentStages>(
        () => initialStages ?? {},
    );
    const panelRef = useRef<HTMLDivElement>(null);
    const firstSelectRef = useRef<HTMLSelectElement>(null);
    const titleId = useId();

    const total = sumPaymentStages(stages);
    const isOver = total > 100;
    const isComplete = total === 100;

    useEffect(() => {
        firstSelectRef.current?.focus();

        const handlePointerDown = (event: MouseEvent) => {
            if (!panelRef.current?.contains(event.target as Node)) {
                onCancel();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [onCancel]);

    const updateStage = (key: PaymentStageKey, value: string) => {
        setStages((current) => {
            const next = { ...current };

            if (value === '') {
                delete next[key];
            } else {
                next[key] = value as PaymentStages[PaymentStageKey];
            }

            return next;
        });
    };

    const handleSave = () => {
        if (total !== 100) {
            return;
        }

        onSave(stages);
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/55 p-4">
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-surface)] shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4 border-b border-[var(--color-gold)]/20 px-6 py-4">
                    <div>
                        <h2
                            id={titleId}
                            className="text-lg font-semibold text-[var(--color-ink)]"
                        >
                            Payment Type Configuration
                        </h2>
                        <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                            Set each stage's share of the payment. The stages
                            must add up to 100%.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        aria-label="Close payment configuration"
                        className="rounded-md px-2 py-1 text-xl leading-none text-[var(--color-ink)]/55 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-accent)]"
                    >
                        ×
                    </button>
                </div>

                <div className="px-6 py-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {PAYMENT_STAGE_KEYS.map((key, index) => {
                            const fieldId = `payment-stage-${key.replace(/\s+/g, '-').toLowerCase()}`;

                            return (
                                <div key={key}>
                                    <label
                                        htmlFor={fieldId}
                                        className={labelClass}
                                    >
                                        {key}
                                    </label>
                                    <select
                                        id={fieldId}
                                        ref={
                                            index === 0
                                                ? firstSelectRef
                                                : undefined
                                        }
                                        value={stages[key] ?? ''}
                                        onChange={(event) =>
                                            updateStage(key, event.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">—</option>
                                        {PAYMENT_PERCENTAGE_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className={`mt-5 flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                            isOver
                                ? 'border-red-500/30 bg-red-500/10 text-red-700'
                                : isComplete
                                  ? 'border-green-500/30 bg-green-500/10 text-green-700'
                                  : 'border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] text-[var(--color-ink)]/70'
                        }`}
                    >
                        <span>Total Percentage</span>
                        <span>{total}%</span>
                    </div>

                    {isOver && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                            Total percentage cannot exceed 100%.
                        </p>
                    )}

                    {isComplete && (
                        <p className="mt-2 text-xs font-semibold text-green-600">
                            Total percentage reached 100%.
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[var(--color-gold)]/20 px-6 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className={secondaryButtonClass}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={total !== 100}
                        className={primaryButtonClass}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
