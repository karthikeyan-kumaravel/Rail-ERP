export type ExportRow = Array<string | number | boolean | null | undefined>;

export function normalizeCell(
    cell: string | number | boolean | null | undefined,
): string {
    return cell === null || cell === undefined ? '' : String(cell);
}

export function buildDelimitedRows(
    headers: string[],
    rows: ExportRow[],
    delimiter: string,
): string {
    return [headers, ...rows]
        .map((row) => row.map((cell) => normalizeCell(cell)).join(delimiter))
        .join('\n');
}

export function buildCsvRows(headers: string[], rows: ExportRow[]): string {
    return [headers, ...rows]
        .map((row) =>
            row
                .map((cell) => `"${normalizeCell(cell).replace(/"/g, '""')}"`)
                .join(','),
        )
        .join('\r\n');
}

export async function copyTextToClipboard(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);

        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

export function downloadCsv(
    filename: string,
    headers: string[],
    rows: ExportRow[],
): void {
    const csv = buildCsvRows(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
