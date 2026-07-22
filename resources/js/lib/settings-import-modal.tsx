import { useRef, useState } from 'react';
import {
    preview as previewRoute,
    store as storeRoute,
    template,
} from '@/routes/admin/imports';

export type SettingsImportModule =
    | 'states'
    | 'districts'
    | 'cities'
    | 'zones'
    | 'divisions'
    | 'stations'
    | 'customers'
    | 'vendors'
    | 'activities'
    | 'engineer-types'
    | 'units'
    | 'departments'
    | 'schedule-names'
    | 'schedule-types'
    | 'projects';

type ImportColumn = {
    key: string;
    heading: string;
    required?: boolean;
};

type ImportSummary = {
    total_records: number;
    successfully_imported: number;
    failed_records: number;
    duplicate_records: number;
    preview_valid_records?: number;
};

type ImportRow = {
    row_number: number | null;
    status: 'valid' | 'invalid' | 'duplicate' | string;
    values: Record<string, string>;
    errors: string[];
};

type PreviewResponse = {
    token: string;
    file_name: string;
    module_label: string;
    columns: ImportColumn[];
    rows: ImportRow[];
    summary: ImportSummary;
    template_url: string;
};

type CommitResponse = {
    message: string;
    summary: ImportSummary;
    validation_errors: ImportRow[];
    error_report_url: string | null;
};

type Toast = {
    type: 'success' | 'error';
    message: string;
};

type SettingsImportModalProps = {
    module: SettingsImportModule;
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onImported: () => void;
};

const csrfToken = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

const buttonClass =
    'rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
const primaryButtonClass = `${buttonClass} bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-lg hover:brightness-110`;
const secondaryButtonClass = `${buttonClass} border border-[var(--color-gold)]/25 text-[var(--color-ink)]/80 hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]`;

export default function SettingsImportModal({
    module,
    title,
    isOpen,
    onClose,
    onImported,
}: SettingsImportModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<PreviewResponse | null>(null);
    const [result, setResult] = useState<CommitResponse | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    if (!isOpen) {
        return null;
    }

    const reset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsImporting(false);
        setToast(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const close = () => {
        reset();
        onClose();
    };

    const selectFile = (nextFile: File | null) => {
        setResult(null);
        setPreview(null);

        if (!nextFile) {
            setFile(null);

            return;
        }

        const isExcel = /\.(xlsx|xls)$/i.test(nextFile.name);

        if (!isExcel) {
            setToast({
                type: 'error',
                message: 'Upload a valid .xlsx or .xls file.',
            });
            setFile(null);

            return;
        }

        setToast(null);
        setFile(nextFile);
    };

    const previewImport = () => {
        if (!file || isUploading) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        const request = new XMLHttpRequest();

        setIsUploading(true);
        setUploadProgress(0);
        setToast(null);

        request.open('POST', previewRoute.url(module));
        request.setRequestHeader('X-CSRF-TOKEN', csrfToken());
        request.setRequestHeader('Accept', 'application/json');

        request.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                setUploadProgress(
                    Math.round((event.loaded / event.total) * 100),
                );
            }
        };

        request.onload = () => {
            setIsUploading(false);

            try {
                const response = JSON.parse(request.responseText || '{}');

                if (request.status >= 200 && request.status < 300) {
                    setPreview(response as PreviewResponse);
                    setUploadProgress(100);
                    setToast({
                        type: 'success',
                        message: 'Preview generated successfully.',
                    });
                } else {
                    setToast({
                        type: 'error',
                        message:
                            response.message ??
                            response.errors?.file?.[0] ??
                            'Unable to preview this Excel file.',
                    });
                }
            } catch {
                setToast({
                    type: 'error',
                    message: 'Unable to read the preview response.',
                });
            }
        };

        request.onerror = () => {
            setIsUploading(false);
            setToast({
                type: 'error',
                message: 'Upload failed. Please try again.',
            });
        };

        request.send(formData);
    };

    const confirmImport = async () => {
        if (!preview || isImporting) {
            return;
        }

        setIsImporting(true);
        setToast(null);

        const response = await fetch(storeRoute.url(module), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
            body: JSON.stringify({ token: preview.token }),
        });

        const payload = await response.json().catch(() => ({}));
        setIsImporting(false);

        if (!response.ok) {
            setToast({
                type: 'error',
                message:
                    payload.message ??
                    payload.errors?.token?.[0] ??
                    'Import failed. No records were saved.',
            });

            return;
        }

        setResult(payload as CommitResponse);
        setToast({
            type: 'success',
            message: payload.message ?? 'Import completed successfully.',
        });
        onImported();
    };

    const visibleRows = preview?.rows.slice(0, 25) ?? [];
    const errorRows =
        result?.validation_errors ??
        preview?.rows.filter((row) => row.status !== 'valid') ??
        [];
    const summary = result?.summary ?? preview?.summary;
    const validCount = preview?.summary.preview_valid_records ?? 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/55 p-4 print:hidden">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-surface)] shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--color-gold)]/20 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                            Import {title}
                        </h2>
                        <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                            {file?.name ?? 'Choose an Excel file to preview.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        className="rounded-md px-2 py-1 text-xl leading-none text-[var(--color-ink)]/55 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-accent)]"
                        aria-label="Close import modal"
                    >
                        x
                    </button>
                </div>

                <div className="max-h-[calc(92vh-82px)] overflow-y-auto px-6 py-5">
                    {toast && (
                        <div
                            className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
                                toast.type === 'success'
                                    ? 'border-[var(--color-accent-2)]/30 bg-[var(--color-accent-2)]/10 text-[var(--color-ink)]'
                                    : 'border-red-500/25 bg-red-500/10 text-red-700'
                            }`}
                        >
                            {toast.message}
                        </div>
                    )}

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                        <div
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                                event.preventDefault();
                                selectFile(event.dataTransfer.files.item(0));
                            }}
                            className="rounded-lg border border-dashed border-[var(--color-gold)]/45 bg-[var(--color-surface-soft)]/55 px-4 py-6 text-center"
                        >
                            <p className="text-sm font-semibold text-[var(--color-ink)]">
                                Drop Excel file here
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-ink)]/55">
                                .xlsx and .xls files only
                            </p>
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className={secondaryButtonClass}
                                >
                                    Choose File
                                </button>
                                <a
                                    href={template.url(module)}
                                    className={secondaryButtonClass}
                                >
                                    Download Sample Template
                                </a>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={(event) =>
                                    selectFile(
                                        event.target.files?.item(0) ?? null,
                                    )
                                }
                            />
                        </div>

                        <div className="flex min-w-56 flex-col justify-center gap-3">
                            <button
                                type="button"
                                onClick={previewImport}
                                disabled={!file || isUploading}
                                className={primaryButtonClass}
                            >
                                {isUploading ? 'Uploading...' : 'Preview Data'}
                            </button>
                            <button
                                type="button"
                                onClick={confirmImport}
                                disabled={
                                    !preview || validCount === 0 || isImporting
                                }
                                className={primaryButtonClass}
                            >
                                {isImporting
                                    ? 'Importing...'
                                    : 'Confirm Import'}
                            </button>
                            <button
                                type="button"
                                onClick={close}
                                className={secondaryButtonClass}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {(isUploading || uploadProgress > 0) && (
                        <div className="mt-4">
                            <div className="mb-1 flex justify-between text-xs text-[var(--color-ink)]/60">
                                <span>Upload progress</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
                                <div
                                    className="h-full bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {summary && (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <SummaryCard
                                label="Total Records"
                                value={summary.total_records}
                            />
                            <SummaryCard
                                label={
                                    result
                                        ? 'Successfully Imported'
                                        : 'Ready To Import'
                                }
                                value={
                                    result
                                        ? summary.successfully_imported
                                        : (summary.preview_valid_records ?? 0)
                                }
                            />
                            <SummaryCard
                                label="Failed Records"
                                value={summary.failed_records}
                            />
                            <SummaryCard
                                label="Duplicate Records"
                                value={summary.duplicate_records}
                            />
                        </div>
                    )}

                    {preview && (
                        <section className="mt-5">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                                    Import Preview
                                </h3>
                                {preview.rows.length > visibleRows.length && (
                                    <span className="text-xs text-[var(--color-ink)]/55">
                                        Showing first {visibleRows.length} rows
                                    </span>
                                )}
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-[var(--color-gold)]/20">
                                <table className="w-full min-w-[860px] text-left text-xs">
                                    <thead className="bg-[var(--color-surface-soft)] text-[var(--color-ink)]">
                                        <tr>
                                            <th className="px-3 py-2">Row</th>
                                            <th className="px-3 py-2">
                                                Status
                                            </th>
                                            {preview.columns.map((column) => (
                                                <th
                                                    key={column.key}
                                                    className="px-3 py-2"
                                                >
                                                    {column.heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleRows.map((row) => (
                                            <tr
                                                key={`${row.row_number}-${row.status}`}
                                                className="border-t border-[var(--color-gold)]/15 text-[var(--color-ink)]/80"
                                            >
                                                <td className="px-3 py-2">
                                                    {row.row_number}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <StatusPill
                                                        status={row.status}
                                                    />
                                                </td>
                                                {preview.columns.map(
                                                    (column) => (
                                                        <td
                                                            key={column.key}
                                                            className="max-w-56 px-3 py-2"
                                                        >
                                                            {row.values[
                                                                column.key
                                                            ] ?? ''}
                                                        </td>
                                                    ),
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {errorRows.length > 0 && (
                        <section className="mt-5">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                                    Validation Errors
                                </h3>
                                {result?.error_report_url && (
                                    <a
                                        href={result.error_report_url}
                                        className={secondaryButtonClass}
                                    >
                                        Download Error Report
                                    </a>
                                )}
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-red-500/15">
                                <table className="w-full min-w-[760px] text-left text-xs">
                                    <thead className="bg-red-500/10 text-red-700">
                                        <tr>
                                            <th className="px-3 py-2">Row</th>
                                            <th className="px-3 py-2">
                                                Status
                                            </th>
                                            <th className="px-3 py-2">
                                                Errors
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {errorRows
                                            .slice(0, 50)
                                            .map((row, index) => (
                                                <tr
                                                    key={`${row.row_number ?? 'global'}-${index}`}
                                                    className="border-t border-red-500/10 text-[var(--color-ink)]/80"
                                                >
                                                    <td className="px-3 py-2">
                                                        {row.row_number ?? '-'}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <StatusPill
                                                            status={row.status}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {row.errors.join('; ')}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-[var(--color-gold)]/20 bg-[var(--color-surface-soft)]/45 px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase">
                {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--color-ink)]">
                {value}
            </p>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const statusClass =
        status === 'valid'
            ? 'bg-emerald-50 text-emerald-700'
            : status === 'duplicate'
              ? 'bg-[var(--color-accent)]/15 text-[var(--color-status-orange-text)]'
              : 'bg-red-50 text-red-600';

    return (
        <span className={`rounded-full px-2 py-1 font-semibold ${statusClass}`}>
            {status}
        </span>
    );
}
