import { useRef } from 'react';
import { DocumentIcon, TrashIcon } from '@/lib/icons';

export type FileUploadFieldProps = {
    id?: string;
    file: File | null;
    onChange: (file: File | null) => void;
    existingFileUrl?: string | null;
    existingFileName?: string | null;
    removeExisting?: boolean;
    onRemoveExisting?: (remove: boolean) => void;
    accept?: string;
    disabled?: boolean;
};

const fileInputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-white outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-linear-to-r file:from-[var(--color-accent)] file:to-[var(--color-accent-2)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40 disabled:cursor-not-allowed disabled:opacity-60';

/**
 * A single proof-document field with preview/download, replace, and remove
 * affordances — shared by the EMD/Performance BG/Security BG sections, which
 * all need the exact same upload behavior.
 */
export default function FileUploadField({
    id,
    file,
    onChange,
    existingFileUrl,
    existingFileName,
    removeExisting = false,
    onRemoveExisting,
    accept = '.pdf,.jpg,.jpeg,.png,.docx',
    disabled = false,
}: FileUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasExisting = Boolean(existingFileUrl) && !removeExisting;

    if (file) {
        return (
            <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-ink)]">
                <DocumentIcon className="h-4 w-4 shrink-0 text-[var(--color-gold)]" />
                <span className="flex-1 truncate">{file.name}</span>
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    disabled={disabled}
                    title="Remove selected file"
                    aria-label="Remove selected file"
                    className="shrink-0 text-red-500/80 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        );
    }

    if (hasExisting) {
        return (
            <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-2 text-sm">
                <DocumentIcon className="h-4 w-4 shrink-0 text-[var(--color-gold)]" />
                <a
                    href={existingFileUrl ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 truncate font-medium text-[var(--color-gold)] transition hover:text-[var(--color-accent)]"
                >
                    {existingFileName ?? 'View / Download'}
                </a>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                    className="shrink-0 text-xs font-semibold text-[var(--color-ink)]/70 transition hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Replace
                </button>
                {onRemoveExisting && (
                    <button
                        type="button"
                        onClick={() => onRemoveExisting(true)}
                        disabled={disabled}
                        title="Remove file"
                        aria-label="Remove file"
                        className="shrink-0 text-red-500/80 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    accept={accept}
                    disabled={disabled}
                    onChange={(event) =>
                        onChange(event.target.files?.[0] ?? null)
                    }
                    className="hidden"
                />
            </div>
        );
    }

    return (
        <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            disabled={disabled}
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
            className={fileInputClass}
        />
    );
}
