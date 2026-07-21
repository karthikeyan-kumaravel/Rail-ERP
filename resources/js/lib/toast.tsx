import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashToast() {
    const { flash } = usePage().props;
    const [dismissedSuccess, setDismissedSuccess] = useState<string | null>(
        null,
    );
    const [dismissedError, setDismissedError] = useState<string | null>(null);

    useEffect(() => {
        if (!flash.success) {
            return;
        }

        const timeout = setTimeout(
            () => setDismissedSuccess(flash.success),
            4000,
        );

        return () => clearTimeout(timeout);
    }, [flash.success]);

    useEffect(() => {
        if (!flash.error) {
            return;
        }

        const timeout = setTimeout(() => setDismissedError(flash.error), 5000);

        return () => clearTimeout(timeout);
    }, [flash.error]);

    const visibleSuccess =
        flash.success && flash.success !== dismissedSuccess
            ? flash.success
            : null;
    const visibleError =
        flash.error && flash.error !== dismissedError ? flash.error : null;

    if (!visibleSuccess && !visibleError) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 print:hidden">
            {visibleSuccess && (
                <div
                    role="status"
                    className="rounded-lg border border-[var(--color-accent-2)]/30 bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] shadow-2xl backdrop-blur-xl"
                >
                    {visibleSuccess}
                </div>
            )}
            {visibleError && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-[var(--color-surface)] px-4 py-3 text-sm text-red-600 shadow-2xl backdrop-blur-xl"
                >
                    {visibleError}
                </div>
            )}
        </div>
    );
}
