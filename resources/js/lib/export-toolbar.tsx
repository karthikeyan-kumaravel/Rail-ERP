import { useMemo } from 'react';
import {
    copyTextToClipboard,
    downloadCsv,
    normalizeCell,
} from '@/lib/export-utils';
import ToolbarActionButton from '@/lib/toolbar-action-button';
import { cn } from '@/lib/utils';

export type ExportCell = string | number | boolean | null | undefined;

export type ExportToolbarProps = {
    headers: string[];
    rows: ExportCell[][];
    filename: string;
    className?: string;
};

export default function ExportToolbar({
    headers,
    rows,
    filename,
    className,
}: ExportToolbarProps) {
    const hasRows = rows.length > 0;

    const copyText = useMemo(() => {
        if (!hasRows) {
            return `${headers.join('\t')}\n`;
        }

        return [headers, ...rows]
            .map((row) => row.map((cell) => normalizeCell(cell)).join('\t'))
            .join('\n');
    }, [headers, rows, hasRows]);

    const handleCopy = async () => {
        await copyTextToClipboard(copyText);
    };

    const handleCsv = () => {
        downloadCsv(filename, headers, rows);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            <ToolbarActionButton
                color="#3b82f6"
                onClick={handleCopy}
                disabled={!hasRows}
            >
                Copy
            </ToolbarActionButton>
            <ToolbarActionButton
                color="#22c55e"
                onClick={handleCsv}
                disabled={!hasRows}
            >
                CSV
            </ToolbarActionButton>
            <ToolbarActionButton color="#8b5cf6" onClick={handlePrint}>
                Print
            </ToolbarActionButton>
        </div>
    );
}
