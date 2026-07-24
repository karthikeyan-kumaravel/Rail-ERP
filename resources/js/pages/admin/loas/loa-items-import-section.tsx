import { Fragment, useRef, useState } from 'react';
import { importPreview } from '@/routes/admin/loas/items';
import { inputClass, labelClass } from './loa-form-fields';
import type {
    BidRateUnit,
    InspectionBy,
    LoaFormErrors,
    LoaItemFormData,
    PaymentStages,
    ScheduleNameOption,
    ScheduleTypeOption,
    UnitOption,
} from './loa-form-fields';
import PaymentStagesField from './payment-stages-field';

const INSPECTION_BY_OPTIONS: InspectionBy[] = ['RITES', 'RDSO', 'Consignee'];

type LoaItemsImportSectionProps = {
    items: LoaItemFormData[];
    errors: LoaFormErrors;
    scheduleNames: ScheduleNameOption[];
    scheduleTypes: ScheduleTypeOption[];
    units: UnitOption[];
    onItemsChange: (items: LoaItemFormData[]) => void;
};

type FeedMode = 'import' | 'manual';

/** Which of Bid Rate / Bid Amount the user is actively driving; the other is derived. */
type BidEntryMode = 'rate' | 'amount';

type ManualItemDraft = {
    schedule_name_id: number | '';
    schedule_type_id: number | '';
    item_no: string;
    item_description: string;
    item_code: string;
    item_quantity: string;
    quantity_unit: string;
    unit_rate: string;
    escalation: string;
    bid_rate: string;
    bid_amount: string;
    bid_entry_mode: BidEntryMode;
    rebate_enabled: boolean;
    rebate_percentage: string;
    inspection_by: InspectionBy | '';
    payment_stages: PaymentStages | null;
};

function emptyManualDraft(): ManualItemDraft {
    return {
        schedule_name_id: '',
        schedule_type_id: '',
        item_no: '',
        item_description: '',
        item_code: '',
        item_quantity: '',
        quantity_unit: '',
        unit_rate: '',
        escalation: '',
        bid_rate: '',
        bid_amount: '',
        bid_entry_mode: 'rate',
        rebate_enabled: false,
        rebate_percentage: '',
        inspection_by: '',
        payment_stages: null,
    };
}

type ImportResponse = {
    items: LoaItemFormData[];
    summary: {
        imported_rows: number;
        skipped_rows: number;
        header_row: number;
    };
};

type ImportMessage = {
    type: 'success' | 'error';
    text: string;
};

type ImportErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

const csrfToken = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

const smallInputClass =
    'w-full min-w-24 rounded-md border border-[var(--color-gold)]/30 bg-[var(--color-surface)] px-2 py-1.5 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/35';

function formatNumber(
    value: number | string,
    maximumFractionDigits = 2,
    minimumFractionDigits = Math.min(2, maximumFractionDigits),
) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return String(value);
    }

    return numericValue.toLocaleString('en-IN', {
        minimumFractionDigits,
        maximumFractionDigits,
    });
}

function formatMoney(value: number | string | null) {
    if (value === null || value === '') {
        return '';
    }

    return `₹${formatNumber(value)}`;
}

/**
 * Strips a formatted amount ("₹29,313.20") back down to a plain numeric
 * string ("29313.20") as the user types, keeping only the first decimal
 * point so a stray extra "." can't be typed.
 */
function parseAmountInput(value: string): string {
    const digitsAndDots = value.replace(/[^0-9.]/g, '');
    const firstDotIndex = digitsAndDots.indexOf('.');

    if (firstDotIndex === -1) {
        return digitsAndDots;
    }

    return (
        digitsAndDots.slice(0, firstDotIndex + 1) +
        digitsAndDots.slice(firstDotIndex + 1).replace(/\./g, '')
    );
}

function toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    const numeric = Number(value);

    return Number.isFinite(numeric) ? numeric : 0;
}

function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}

/** Advt. Value (Rs) = (Item Qty * Unit Rate) + (Item Qty * Unit Rate / 100) * Escl. */
function calculateAdvertisedValue(
    quantity: number | string,
    unitRate: number | string,
    escalation: number | string | null,
): number {
    const qty = toNumber(quantity);
    const rate = toNumber(unitRate);
    const escl = toNumber(escalation);

    return roundMoney(qty * rate + ((qty * rate) / 100) * escl);
}

function roundPercentage(value: number): number {
    return Math.round(value * 10000) / 10000;
}

/** Bid Amount (Rs) driven off a directly entered Bid Rate: Item Qty * Bid Rate. */
function calculateBidAmountFromRate(
    quantity: number | string,
    bidRate: number | string,
): number {
    return roundMoney(toNumber(quantity) * toNumber(bidRate));
}

/** Bid Rate driven off a directly entered Bid Amount: Bid Amount / Item Qty. */
function calculateBidRateFromAmount(
    quantity: number | string,
    bidAmount: number | string,
): number {
    const qty = toNumber(quantity);

    if (qty <= 0) {
        return 0;
    }

    return roundMoney(toNumber(bidAmount) / qty);
}

/** Percentage deviation of the Bid Amount from the Advt. Value. */
function calculatePercentageValue(
    advertisedValue: number,
    bidAmount: number | string,
): number {
    if (advertisedValue <= 0) {
        return 0;
    }

    const amount = toNumber(bidAmount);

    return roundPercentage(
        Math.abs(((amount - advertisedValue) / advertisedValue) * 100),
    );
}

/**
 * "% Above" when the Bid Amount exceeds the Advt. Value, "% Below" when it
 * undercuts it, or null when they're equal.
 */
function deriveBidRateUnit(
    advertisedValue: number,
    bidAmount: number | string,
): BidRateUnit | null {
    const amount = toNumber(bidAmount);

    if (amount > advertisedValue) {
        return '% Above';
    }

    if (amount < advertisedValue) {
        return '% Below';
    }

    return null;
}

/** Rebate Amount = (Bid Amount × Rebate %) / 100. */
function calculateRebateAmount(
    bidAmount: number | string,
    rebatePercentage: number | string,
): number {
    return roundMoney((toNumber(bidAmount) * toNumber(rebatePercentage)) / 100);
}

/** Final Bid Amount = Bid Amount − Rebate Amount, floored at zero. */
function calculateFinalBidAmount(
    bidAmount: number | string,
    rebatePercentage: number | string,
): number {
    return Math.max(
        0,
        roundMoney(
            toNumber(bidAmount) -
                calculateRebateAmount(bidAmount, rebatePercentage),
        ),
    );
}

/**
 * Color cue for the read-only Bid % Value box: green for a favorable "%
 * Below" bid, red for a "% Above" bid, muted when the bid is at par.
 */
function bidPercentageToneClass(unit: BidRateUnit | null): string {
    if (unit === '% Above') {
        return 'border-red-500/40 bg-red-500/10 text-red-700';
    }

    if (unit === '% Below') {
        return 'border-green-500/40 bg-green-500/10 text-green-700';
    }

    return 'border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] text-[var(--color-ink)]/55';
}

const bidPercentageBoxClass =
    'w-full rounded-lg border px-4 py-2.5 text-sm font-semibold outline-none disabled:cursor-not-allowed';
const bidPercentageSmallBoxClass =
    'w-full min-w-24 rounded-md border px-2 py-1.5 text-xs font-semibold disabled:cursor-not-allowed';

export default function LoaItemsImportSection({
    items,
    errors,
    scheduleNames,
    scheduleTypes,
    units,
    onItemsChange,
}: LoaItemsImportSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [message, setMessage] = useState<ImportMessage | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [draft, setDraft] = useState<LoaItemFormData | null>(null);
    const [editBidEntryMode, setEditBidEntryMode] =
        useState<BidEntryMode>('rate');
    const [feedMode] = useState<FeedMode>('manual');
    const [manualDraft, setManualDraft] =
        useState<ManualItemDraft>(emptyManualDraft());
    const [isManualBidAmountFocused, setIsManualBidAmountFocused] =
        useState(false);
    const [isDraftBidAmountFocused, setIsDraftBidAmountFocused] =
        useState(false);

    const updateManualDraft = <Key extends keyof ManualItemDraft>(
        key: Key,
        value: ManualItemDraft[Key],
    ) => {
        setManualDraft((current) => ({ ...current, [key]: value }));
    };

    /**
     * Item Qty is the one field that feeds both Advt. Value and, via
     * whichever Bid field is currently the entry mode, the derived Bid
     * Rate/Bid Amount — so it needs to recompute the dependent one instead
     * of a plain field assignment.
     */
    const handleManualQuantityChange = (value: string) => {
        setManualDraft((current) => {
            const next = { ...current, item_quantity: value };

            if (next.bid_entry_mode === 'rate') {
                next.bid_amount = String(
                    calculateBidAmountFromRate(
                        next.item_quantity,
                        next.bid_rate,
                    ),
                );
            } else {
                next.bid_rate = String(
                    calculateBidRateFromAmount(
                        next.item_quantity,
                        next.bid_amount,
                    ),
                );
            }

            return next;
        });
    };

    const handleManualBidRateChange = (value: string) => {
        setManualDraft((current) => ({
            ...current,
            bid_entry_mode: 'rate',
            bid_rate: value,
            bid_amount: String(
                calculateBidAmountFromRate(current.item_quantity, value),
            ),
        }));
    };

    const handleManualBidAmountChange = (value: string) => {
        setManualDraft((current) => ({
            ...current,
            bid_entry_mode: 'amount',
            bid_amount: value,
            bid_rate: String(
                calculateBidRateFromAmount(current.item_quantity, value),
            ),
        }));
    };

    const visibleManualScheduleTypes = manualDraft.schedule_name_id
        ? scheduleTypes.filter(
              (type) => type.schedule_name_id === manualDraft.schedule_name_id,
          )
        : scheduleTypes;

    const handleManualScheduleNameChange = (value: string) => {
        const scheduleNameId = value ? Number(value) : '';
        updateManualDraft('schedule_name_id', scheduleNameId);

        const currentType = scheduleTypes.find(
            (type) => type.id === manualDraft.schedule_type_id,
        );

        if (currentType && currentType.schedule_name_id !== scheduleNameId) {
            updateManualDraft('schedule_type_id', '');
        }
    };

    const visibleScheduleTypesFor = (scheduleNameId: number | '') =>
        scheduleNameId
            ? scheduleTypes.filter(
                  (type) => type.schedule_name_id === scheduleNameId,
              )
            : scheduleTypes;

    const handleDraftScheduleNameChange = (value: string) => {
        const scheduleNameId = value ? Number(value) : '';
        updateDraft('schedule_name_id', scheduleNameId);

        const currentDraftTypeId = draft?.schedule_type_id ?? '';
        const currentType = scheduleTypes.find(
            (type) => type.id === currentDraftTypeId,
        );

        if (currentType && currentType.schedule_name_id !== scheduleNameId) {
            updateDraft('schedule_type_id', '');
        }
    };

    const addManualItem = () => {
        if (!manualDraft.item_description.trim()) {
            setMessage({
                type: 'error',
                text: 'Item description is required to add an item.',
            });

            return;
        }

        const advertisedValue = calculateAdvertisedValue(
            manualDraft.item_quantity,
            manualDraft.unit_rate,
            manualDraft.escalation,
        );
        const rebateEnabled = manualDraft.rebate_enabled;
        const rebatePercentage = rebateEnabled
            ? toNumber(manualDraft.rebate_percentage)
            : 0;
        const rebateAmount = rebateEnabled
            ? calculateRebateAmount(manualDraft.bid_amount, rebatePercentage)
            : 0;
        const finalBidAmount = rebateEnabled
            ? calculateFinalBidAmount(manualDraft.bid_amount, rebatePercentage)
            : toNumber(manualDraft.bid_amount);

        const newItem: LoaItemFormData = {
            schedule_name_id: manualDraft.schedule_name_id,
            schedule_type_id: manualDraft.schedule_type_id,
            schedule_name: null,
            schedule_advertised_value: null,
            item_no:
                manualDraft.item_no.trim() ||
                String(items.length + 1).padStart(2, '0'),
            item_description: manualDraft.item_description,
            item_code: manualDraft.item_code || null,
            item_quantity:
                manualDraft.item_quantity === ''
                    ? 0
                    : Number(manualDraft.item_quantity),
            quantity_unit: manualDraft.quantity_unit,
            unit_rate:
                manualDraft.unit_rate === ''
                    ? 0
                    : Number(manualDraft.unit_rate),
            escalation:
                manualDraft.escalation === ''
                    ? null
                    : Number(manualDraft.escalation),
            advertised_value: advertisedValue,
            bid_rate:
                manualDraft.bid_rate === '' ? 0 : Number(manualDraft.bid_rate),
            bid_rate_unit: deriveBidRateUnit(
                advertisedValue,
                manualDraft.bid_amount,
            ),
            bid_percentage_value: calculatePercentageValue(
                advertisedValue,
                manualDraft.bid_amount,
            ),
            bid_amount:
                manualDraft.bid_amount === ''
                    ? 0
                    : Number(manualDraft.bid_amount),
            rebate_enabled: rebateEnabled,
            rebate_percentage: rebatePercentage,
            rebate_amount: rebateAmount,
            final_bid_amount: finalBidAmount,
            inspection_by: manualDraft.inspection_by || null,
            payment_stages: manualDraft.payment_stages,
        };

        onItemsChange([...items, newItem]);
        setManualDraft(emptyManualDraft());
        setMessage({
            type: 'success',
            text: 'Item added to the list below.',
        });
    };

    const selectFile = (nextFile: File | null) => {
        if (!nextFile) {
            setFile(null);

            return;
        }

        if (!/\.(xlsx|xls)$/i.test(nextFile.name)) {
            setFile(null);
            setMessage({
                type: 'error',
                text: 'Upload a valid .xlsx or .xls file.',
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            return;
        }

        setFile(nextFile);
        setMessage(null);
    };

    const importItems = async () => {
        if (!file || isImporting) {
            return;
        }

        const selectedFileName = file.name;
        const formData = new FormData();
        formData.append('file', file);

        setIsImporting(true);
        setMessage(null);

        try {
            const response = await fetch(importPreview.url(), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: formData,
            });
            const payload = (await response.json().catch(() => ({}))) as
                ImportResponse | ImportErrorResponse;

            if (!response.ok || !('items' in payload)) {
                const errorPayload = payload as ImportErrorResponse;
                const firstValidationError = Object.values(
                    errorPayload.errors ?? {},
                ).flat()[0];

                setMessage({
                    type: 'error',
                    text:
                        firstValidationError ??
                        errorPayload.message ??
                        'Unable to import this Excel file.',
                });

                return;
            }

            onItemsChange(payload.items);
            setEditingIndex(null);
            setDraft(null);
            setFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            const skippedText =
                payload.summary.skipped_rows > 0
                    ? ` ${payload.summary.skipped_rows} blank, footer, or non-item row(s) were skipped.`
                    : '';

            setMessage({
                type: 'success',
                text: `${payload.summary.imported_rows} item(s) loaded from ${selectedFileName}.${skippedText} The imported list below replaces any previous list.`,
            });
        } catch {
            setMessage({
                type: 'error',
                text: 'The Excel upload failed. Please try again.',
            });
        } finally {
            setIsImporting(false);
        }
    };

    const startEditing = (index: number) => {
        const item = items[index];

        setEditingIndex(index);
        setDraft({ ...item });
        setEditBidEntryMode('rate');
    };

    const updateDraft = <Key extends keyof LoaItemFormData>(
        key: Key,
        value: LoaItemFormData[Key],
    ) => {
        setDraft((current) =>
            current === null ? current : { ...current, [key]: value },
        );
    };

    /**
     * Item Qty feeds both Advt. Value and, via whichever Bid field is the
     * current entry mode, the derived Bid Rate/Bid Amount.
     */
    const handleDraftQuantityChange = (
        value: LoaItemFormData['item_quantity'],
    ) => {
        setDraft((current) => {
            if (current === null) {
                return current;
            }

            const next = { ...current, item_quantity: value };

            if (editBidEntryMode === 'rate') {
                next.bid_amount = calculateBidAmountFromRate(
                    next.item_quantity,
                    next.bid_rate,
                );
            } else {
                next.bid_rate = calculateBidRateFromAmount(
                    next.item_quantity,
                    next.bid_amount,
                );
            }

            return next;
        });
    };

    const handleDraftBidRateChange = (value: LoaItemFormData['bid_rate']) => {
        setEditBidEntryMode('rate');
        setDraft((current) =>
            current === null
                ? current
                : {
                      ...current,
                      bid_rate: value,
                      bid_amount: calculateBidAmountFromRate(
                          current.item_quantity,
                          value,
                      ),
                  },
        );
    };

    const handleDraftBidAmountChange = (
        value: LoaItemFormData['bid_amount'],
    ) => {
        setEditBidEntryMode('amount');
        setDraft((current) =>
            current === null
                ? current
                : {
                      ...current,
                      bid_amount: value,
                      bid_rate: calculateBidRateFromAmount(
                          current.item_quantity,
                          value,
                      ),
                  },
        );
    };

    const saveEditedItem = () => {
        if (editingIndex === null || draft === null) {
            return;
        }

        const advertisedValue = calculateAdvertisedValue(
            draft.item_quantity,
            draft.unit_rate,
            draft.escalation,
        );

        const bidAmount = toNumber(draft.bid_amount);
        const rebatePercentage = draft.rebate_enabled
            ? toNumber(draft.rebate_percentage)
            : 0;

        const finalizedDraft: LoaItemFormData = {
            ...draft,
            advertised_value: advertisedValue,
            bid_rate: toNumber(draft.bid_rate),
            bid_amount: bidAmount,
            bid_rate_unit: deriveBidRateUnit(advertisedValue, draft.bid_amount),
            bid_percentage_value: calculatePercentageValue(
                advertisedValue,
                draft.bid_amount,
            ),
            rebate_percentage: rebatePercentage,
            rebate_amount: draft.rebate_enabled
                ? calculateRebateAmount(bidAmount, rebatePercentage)
                : 0,
            final_bid_amount: draft.rebate_enabled
                ? calculateFinalBidAmount(bidAmount, rebatePercentage)
                : bidAmount,
        };

        onItemsChange(
            items.map((item, index) =>
                index === editingIndex ? finalizedDraft : item,
            ),
        );
        setEditingIndex(null);
        setDraft(null);
        setEditBidEntryMode('rate');
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setDraft(null);
        setEditBidEntryMode('rate');
    };

    const deleteItem = (index: number) => {
        if (!window.confirm('Delete this imported item from the LOA?')) {
            return;
        }

        onItemsChange(items.filter((_, itemIndex) => itemIndex !== index));

        if (editingIndex === index) {
            cancelEditing();
        } else if (editingIndex !== null && editingIndex > index) {
            setEditingIndex(editingIndex - 1);
        }
    };

    const itemError = (index: number, field: keyof LoaItemFormData) =>
        errors[`items.${index}.${field}`];

    const manualAdvertisedValue = calculateAdvertisedValue(
        manualDraft.item_quantity,
        manualDraft.unit_rate,
        manualDraft.escalation,
    );
    const manualBidRateUnit = deriveBidRateUnit(
        manualAdvertisedValue,
        manualDraft.bid_amount,
    );
    const manualPercentageValue = calculatePercentageValue(
        manualAdvertisedValue,
        manualDraft.bid_amount,
    );
    const manualFinalBidAmount = calculateFinalBidAmount(
        manualDraft.bid_amount,
        manualDraft.rebate_percentage,
    );

    return (
        <section>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-[var(--color-ink)]">
                        LOA Item Details
                    </h2>
                    {/* <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                        Feed item details via an Excel import or by adding them
                        one at a time with the form below.
                    </p> */}
                </div>
                {items.length > 0 && (
                    <span className="rounded-full bg-[var(--color-accent-2)]/15 px-3 py-1 text-xs font-semibold text-[var(--color-status-gold-text)]">
                        {items.length} item{items.length === 1 ? '' : 's'}
                    </span>
                )}
            </div>

            {/* <div className="mt-4 inline-flex rounded-lg border border-[var(--color-gold)]/30 p-1">
                <button
                    type="button"
                    onClick={() => setFeedMode('import')}
                    className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
                        feedMode === 'import'
                            ? 'bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-md'
                            : 'text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]'
                    }`}
                >
                    Excel Import
                </button>
                <button
                    type="button"
                    onClick={() => setFeedMode('manual')}
                    className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
                        feedMode === 'manual'
                            ? 'bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-md'
                            : 'text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]'
                    }`}
                >
                    Manual Entry
                </button>
            </div> */}

            {feedMode === 'import' ? (
                <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                        event.preventDefault();
                        selectFile(event.dataTransfer.files.item(0));
                    }}
                    className="mt-4 rounded-xl border border-dashed border-[var(--color-gold)]/45 bg-[var(--color-surface-soft)]/55 p-4"
                >
                    <p className="mb-3 text-xs text-[var(--color-ink)]/55">
                        Import the first worksheet in the supplied 10-column
                        item format. Schedule rows and totals are detected
                        automatically.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-ink)]">
                                {file?.name ??
                                    'Choose or drop an Excel item sheet here'}
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-ink)]/55">
                                .xlsx or .xls, up to 20 MB. A successful upload
                                replaces the current item list.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                            >
                                Choose Excel File
                            </button>
                            <button
                                type="button"
                                onClick={importItems}
                                disabled={!file || isImporting}
                                className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
                            >
                                {isImporting ? 'Importing...' : 'Import Excel'}
                            </button>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={(event) =>
                            selectFile(event.target.files?.item(0) ?? null)
                        }
                    />
                </div>
            ) : (
                <div className="mt-4 rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-surface-soft)]/40 p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label
                                htmlFor="manual_schedule_name_id"
                                className={labelClass}
                            >
                                Schedule Name
                            </label>
                            <select
                                id="manual_schedule_name_id"
                                value={manualDraft.schedule_name_id}
                                onChange={(event) =>
                                    handleManualScheduleNameChange(
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="">Select a schedule name</option>
                                {scheduleNames.map((scheduleName) => (
                                    <option
                                        key={scheduleName.id}
                                        value={scheduleName.id}
                                    >
                                        {scheduleName.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="manual_schedule_type_id"
                                className={labelClass}
                            >
                                Schedule Type
                            </label>
                            <select
                                id="manual_schedule_type_id"
                                value={manualDraft.schedule_type_id}
                                onChange={(event) =>
                                    updateManualDraft(
                                        'schedule_type_id',
                                        event.target.value
                                            ? Number(event.target.value)
                                            : '',
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="">Select a schedule type</option>
                                {visibleManualScheduleTypes.map(
                                    (scheduleType) => (
                                        <option
                                            key={scheduleType.id}
                                            value={scheduleType.id}
                                        >
                                            {scheduleType.name}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="manual_item_no"
                                className={labelClass}
                            >
                                Item Sno
                            </label>
                            <input
                                id="manual_item_no"
                                type="text"
                                value={manualDraft.item_no}
                                onChange={(event) =>
                                    updateManualDraft(
                                        'item_no',
                                        event.target.value,
                                    )
                                }
                                placeholder={String(items.length + 1).padStart(
                                    2,
                                    '0',
                                )}
                                className={inputClass}
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-2">
                            <label
                                htmlFor="manual_item_description"
                                className={labelClass}
                            >
                                Item Desc
                            </label>
                            <textarea
                                id="manual_item_description"
                                rows={2}
                                value={manualDraft.item_description}
                                onChange={(event) =>
                                    updateManualDraft(
                                        'item_description',
                                        event.target.value,
                                    )
                                }
                                placeholder="e.g. Supply of signalling cable"
                                className={`${inputClass} resize-y`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="manual_item_code"
                                className={labelClass}
                            >
                                Item Code
                            </label>
                            <input
                                id="manual_item_code"
                                type="text"
                                value={manualDraft.item_code}
                                onChange={(event) =>
                                    updateManualDraft(
                                        'item_code',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="manual_item_quantity"
                                className={labelClass}
                            >
                                Item Qty
                            </label>
                            <input
                                id="manual_item_quantity"
                                type="number"
                                min={0}
                                step="0.001"
                                value={manualDraft.item_quantity}
                                onChange={(event) =>
                                    handleManualQuantityChange(
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="manual_quantity_unit"
                                className={labelClass}
                            >
                                Qty Unit
                            </label>
                            <select
                                id="manual_quantity_unit"
                                value={manualDraft.quantity_unit}
                                onChange={(event) =>
                                    updateManualDraft(
                                        'quantity_unit',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="">Select a unit</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.name}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="manual_unit_rate"
                                className={labelClass}
                            >
                                Unit Rate (Rs)
                            </label>
                            <input
                                id="manual_unit_rate"
                                type="number"
                                min={0}
                                step="0.01"
                                value={manualDraft.unit_rate}
                                onChange={(event) =>
                                    updateManualDraft(
                                        'unit_rate',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="manual_escalation"
                                className={labelClass}
                            >
                                Escl. (%)
                            </label>
                            <input
                                id="manual_escalation"
                                type="number"
                                min={0}
                                step="0.01"
                                value={manualDraft.escalation}
                                onChange={(event) =>
                                    updateManualDraft(
                                        'escalation',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="manual_advertised_value"
                                className={labelClass}
                            >
                                Advt. Value (Rs)
                            </label>
                            <input
                                id="manual_advertised_value"
                                type="text"
                                disabled
                                value={formatMoney(manualAdvertisedValue)}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                                <input
                                    type="checkbox"
                                    checked={manualDraft.rebate_enabled}
                                    onChange={(event) =>
                                        updateManualDraft(
                                            'rebate_enabled',
                                            event.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded border-[var(--color-gold)]/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)]/40"
                                />
                                Rebate
                            </label>
                        </div>

                        <div>
                            <label
                                htmlFor="manual_bid_rate"
                                className={labelClass}
                            >
                                Bid Rate (Rs)
                            </label>
                            <input
                                id="manual_bid_rate"
                                type="number"
                                min={0}
                                step="0.01"
                                value={manualDraft.bid_rate}
                                onChange={(event) =>
                                    handleManualBidRateChange(
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="manual_bid_percentage_value"
                                className={labelClass}
                            >
                                Bid % Value
                            </label>
                            <input
                                id="manual_bid_percentage_value"
                                type="text"
                                disabled
                                value={
                                    manualBidRateUnit
                                        ? `${formatNumber(manualPercentageValue, 4, 2)}${manualBidRateUnit}`
                                        : 'At par with Advt. Value'
                                }
                                className={`${bidPercentageBoxClass} ${bidPercentageToneClass(manualBidRateUnit)}`}
                            />
                        </div>

                        {manualDraft.rebate_enabled && (
                            <div>
                                <label
                                    htmlFor="manual_rebate_percentage"
                                    className={labelClass}
                                >
                                    Rebate %
                                </label>
                                <input
                                    id="manual_rebate_percentage"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="0.01"
                                    value={manualDraft.rebate_percentage}
                                    onChange={(event) =>
                                        updateManualDraft(
                                            'rebate_percentage',
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="manual_bid_amount"
                                className={labelClass}
                            >
                                Bid Amount (Rs)
                            </label>
                            <input
                                id="manual_bid_amount"
                                type="text"
                                inputMode="decimal"
                                value={
                                    isManualBidAmountFocused ||
                                    manualDraft.bid_amount === ''
                                        ? manualDraft.bid_amount
                                        : formatMoney(manualDraft.bid_amount)
                                }
                                onFocus={() =>
                                    setIsManualBidAmountFocused(true)
                                }
                                onBlur={() =>
                                    setIsManualBidAmountFocused(false)
                                }
                                onChange={(event) =>
                                    handleManualBidAmountChange(
                                        parseAmountInput(event.target.value),
                                    )
                                }
                                className={inputClass}
                            />
                        </div>

                        {manualDraft.rebate_enabled && (
                            <div>
                                <label
                                    htmlFor="manual_final_bid_amount"
                                    className={labelClass}
                                >
                                    Final Bid Amount (Rs)
                                </label>
                                <input
                                    id="manual_final_bid_amount"
                                    type="text"
                                    disabled
                                    value={formatMoney(manualFinalBidAmount)}
                                    className={inputClass}
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="manual_inspection_by"
                                className={labelClass}
                            >
                                Inspection by
                            </label>
                            <select
                                id="manual_inspection_by"
                                value={manualDraft.inspection_by}
                                onChange={(event) =>
                                    updateManualDraft(
                                        'inspection_by',
                                        event.target.value as InspectionBy | '',
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="">Select</option>
                                {INSPECTION_BY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                            <span className={labelClass}>Payment Type</span>
                            <PaymentStagesField
                                value={manualDraft.payment_stages}
                                onChange={(stages) =>
                                    updateManualDraft('payment_stages', stages)
                                }
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={addManualItem}
                        className="mt-4 rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
                    >
                        + Add Item
                    </button>
                </div>
            )}

            {message && (
                <div
                    className={`mt-3 rounded-lg border px-4 py-2.5 text-sm ${
                        message.type === 'success'
                            ? 'border-[var(--color-accent-2)]/30 bg-[var(--color-accent-2)]/10 text-[var(--color-ink)]'
                            : 'border-red-500/25 bg-red-500/10 text-red-700'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {errors.items && (
                <p className="mt-3 text-sm text-red-600">{errors.items}</p>
            )}

            <div className="mt-5 overflow-x-auto rounded-xl border border-[var(--color-gold)]/25">
                <table className="w-full min-w-[2350px] text-left text-xs">
                    <thead className="bg-[var(--color-ink)] text-white">
                        <tr>
                            <th className="w-36 px-3 py-3">Schedule Name</th>
                            <th className="w-32 px-3 py-3">Schedule Type</th>
                            <th className="w-24 px-3 py-3">Item S.No.</th>
                            <th className="min-w-80 px-3 py-3">Item Desc</th>
                            <th className="w-28 px-3 py-3">Item Code</th>
                            <th className="w-28 px-3 py-3 text-right">
                                Item Qty
                            </th>
                            <th className="w-28 px-3 py-3">Qty Unit</th>
                            <th className="w-36 px-3 py-3 text-right">
                                Unit Rate (Rs)
                            </th>
                            <th className="w-28 px-3 py-3">Escl. (%)</th>
                            <th className="w-40 px-3 py-3 text-right">
                                Advt. Value (Rs)
                            </th>
                            <th className="w-32 px-3 py-3 text-right">
                                Bid Rate (Rs)
                            </th>
                            <th className="w-20 px-3 py-3 text-center">
                                Rebate
                            </th>
                            <th className="w-36 px-3 py-3 text-right">
                                Bid % Value
                            </th>
                            <th className="w-28 px-3 py-3 text-right">
                                Rebate %
                            </th>
                            <th className="w-40 px-3 py-3 text-right">
                                Bid Amount (Rs)
                            </th>
                            <th className="w-40 px-3 py-3 text-right">
                                Final Bid Amount (Rs)
                            </th>
                            <th className="w-32 px-3 py-3">Inspection by</th>
                            <th className="min-w-64 px-3 py-3">Payment Type</th>
                            <th className="sticky right-0 w-36 bg-[var(--color-ink)] px-3 py-3 text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={19}
                                    className="px-4 py-8 text-center text-sm text-[var(--color-ink)]/55"
                                >
                                    No item details imported yet.
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => {
                                const isEditing = editingIndex === index;
                                const editedItem =
                                    isEditing && draft ? draft : item;
                                const showSchedule =
                                    item.schedule_name &&
                                    (index === 0 ||
                                        items[index - 1]?.schedule_name !==
                                            item.schedule_name);
                                const additionalRowErrors = Object.entries(
                                    errors,
                                ).flatMap(([key, value]) =>
                                    key.startsWith(`items.${index}.`) &&
                                    !key.endsWith('.item_no') &&
                                    !key.endsWith('.item_description') &&
                                    value
                                        ? [value]
                                        : [],
                                );
                                const editedAdvertisedValue =
                                    calculateAdvertisedValue(
                                        editedItem.item_quantity,
                                        editedItem.unit_rate,
                                        editedItem.escalation,
                                    );
                                const editedBidRateUnit = deriveBidRateUnit(
                                    editedAdvertisedValue,
                                    editedItem.bid_amount,
                                );
                                const editedPercentageValue =
                                    calculatePercentageValue(
                                        editedAdvertisedValue,
                                        editedItem.bid_amount,
                                    );
                                const editedFinalBidAmount =
                                    calculateFinalBidAmount(
                                        editedItem.bid_amount,
                                        editedItem.rebate_percentage,
                                    );

                                return (
                                    <Fragment
                                        key={`${item.item_no}-${item.item_code ?? ''}-${index}`}
                                    >
                                        {showSchedule && (
                                            <tr className="border-t border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] font-semibold text-[var(--color-ink)]">
                                                <td
                                                    colSpan={9}
                                                    className="px-3 py-2.5"
                                                >
                                                    {item.schedule_name}
                                                </td>
                                                <td className="px-3 py-2.5 text-right">
                                                    {formatMoney(
                                                        item.schedule_advertised_value,
                                                    )}
                                                </td>
                                                <td colSpan={9} />
                                            </tr>
                                        )}
                                        <tr className="border-t border-[var(--color-gold)]/15 align-top text-[var(--color-ink)]/85 even:bg-[var(--color-surface-soft)]/25">
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <select
                                                        value={
                                                            editedItem.schedule_name_id
                                                        }
                                                        onChange={(event) =>
                                                            handleDraftScheduleNameChange(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    >
                                                        <option value="">
                                                            Select
                                                        </option>
                                                        {scheduleNames.map(
                                                            (scheduleName) => (
                                                                <option
                                                                    key={
                                                                        scheduleName.id
                                                                    }
                                                                    value={
                                                                        scheduleName.id
                                                                    }
                                                                >
                                                                    {
                                                                        scheduleName.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                ) : (
                                                    (scheduleNames.find(
                                                        (scheduleName) =>
                                                            scheduleName.id ===
                                                            item.schedule_name_id,
                                                    )?.name ?? '—')
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <select
                                                        value={
                                                            editedItem.schedule_type_id
                                                        }
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                'schedule_type_id',
                                                                event.target
                                                                    .value
                                                                    ? Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      )
                                                                    : '',
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    >
                                                        <option value="">
                                                            Select
                                                        </option>
                                                        {visibleScheduleTypesFor(
                                                            editedItem.schedule_name_id,
                                                        ).map(
                                                            (scheduleType) => (
                                                                <option
                                                                    key={
                                                                        scheduleType.id
                                                                    }
                                                                    value={
                                                                        scheduleType.id
                                                                    }
                                                                >
                                                                    {
                                                                        scheduleType.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                ) : (
                                                    (scheduleTypes.find(
                                                        (scheduleType) =>
                                                            scheduleType.id ===
                                                            item.schedule_type_id,
                                                    )?.name ?? '—')
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <input
                                                        value={
                                                            editedItem.item_no
                                                        }
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                'item_no',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    />
                                                ) : (
                                                    item.item_no
                                                )}
                                                {itemError(
                                                    index,
                                                    'item_no',
                                                ) && (
                                                    <p className="mt-1 text-red-600">
                                                        {itemError(
                                                            index,
                                                            'item_no',
                                                        )}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <textarea
                                                        rows={4}
                                                        value={
                                                            editedItem.item_description
                                                        }
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                'item_description',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={`${smallInputClass} min-w-80 resize-y`}
                                                    />
                                                ) : (
                                                    <p className="max-w-96 whitespace-pre-wrap">
                                                        {item.item_description}
                                                    </p>
                                                )}
                                                {itemError(
                                                    index,
                                                    'item_description',
                                                ) && (
                                                    <p className="mt-1 text-red-600">
                                                        {itemError(
                                                            index,
                                                            'item_description',
                                                        )}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <input
                                                        value={
                                                            editedItem.item_code ??
                                                            ''
                                                        }
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                'item_code',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    />
                                                ) : (
                                                    (item.item_code ?? '—')
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.001"
                                                        value={
                                                            editedItem.item_quantity
                                                        }
                                                        onChange={(event) =>
                                                            handleDraftQuantityChange(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    />
                                                ) : (
                                                    formatNumber(
                                                        item.item_quantity,
                                                        3,
                                                        0,
                                                    )
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <select
                                                        value={
                                                            editedItem.quantity_unit
                                                        }
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                'quantity_unit',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    >
                                                        <option value="">
                                                            Select
                                                        </option>
                                                        {!units.some(
                                                            (unit) =>
                                                                unit.name ===
                                                                editedItem.quantity_unit,
                                                        ) &&
                                                            editedItem.quantity_unit && (
                                                                <option
                                                                    value={
                                                                        editedItem.quantity_unit
                                                                    }
                                                                >
                                                                    {
                                                                        editedItem.quantity_unit
                                                                    }
                                                                </option>
                                                            )}
                                                        {units.map((unit) => (
                                                            <option
                                                                key={unit.id}
                                                                value={
                                                                    unit.name
                                                                }
                                                            >
                                                                {unit.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    item.quantity_unit
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={
                                                            editedItem.unit_rate
                                                        }
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                'unit_rate',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    />
                                                ) : (
                                                    formatMoney(item.unit_rate)
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={
                                                            editedItem.escalation ??
                                                            ''
                                                        }
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                'escalation',
                                                                event.target
                                                                    .value ===
                                                                    ''
                                                                    ? null
                                                                    : Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    />
                                                ) : item.escalation !== null &&
                                                  item.escalation !== '' ? (
                                                    `${formatNumber(item.escalation)}%`
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={formatMoney(
                                                            editedAdvertisedValue,
                                                        )}
                                                        className={
                                                            smallInputClass
                                                        }
                                                    />
                                                ) : (
                                                    formatMoney(
                                                        item.advertised_value,
                                                    )
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={
                                                            editedItem.bid_rate
                                                        }
                                                        onChange={(event) =>
                                                            handleDraftBidRateChange(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    />
                                                ) : (
                                                    formatMoney(item.bid_rate)
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editedItem.rebate_enabled
                                                    }
                                                    disabled={!isEditing}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            'rebate_enabled',
                                                            event.target
                                                                .checked,
                                                        )
                                                    }
                                                    aria-label={`Enable rebate for item ${item.item_no}`}
                                                    className="h-4 w-4 rounded border-[var(--color-gold)]/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
                                                />
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            editedBidRateUnit
                                                                ? `${formatNumber(editedPercentageValue, 4, 2)}${editedBidRateUnit}`
                                                                : 'At par'
                                                        }
                                                        className={`${bidPercentageSmallBoxClass} ${bidPercentageToneClass(editedBidRateUnit)}`}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            item.bid_rate_unit
                                                                ? `${formatNumber(item.bid_percentage_value ?? 0, 4, 2)}${item.bid_rate_unit}`
                                                                : 'At par'
                                                        }
                                                        className={`${bidPercentageSmallBoxClass} ${bidPercentageToneClass(item.bid_rate_unit)}`}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {editedItem.rebate_enabled ? (
                                                    isEditing ? (
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            step="0.01"
                                                            value={
                                                                editedItem.rebate_percentage
                                                            }
                                                            onChange={(event) =>
                                                                updateDraft(
                                                                    'rebate_percentage',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={
                                                                smallInputClass
                                                            }
                                                        />
                                                    ) : (
                                                        `${formatNumber(item.rebate_percentage)}%`
                                                    )
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={
                                                            isDraftBidAmountFocused ||
                                                            editedItem.bid_amount ===
                                                                ''
                                                                ? editedItem.bid_amount
                                                                : formatMoney(
                                                                      editedItem.bid_amount,
                                                                  )
                                                        }
                                                        onFocus={() =>
                                                            setIsDraftBidAmountFocused(
                                                                true,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            setIsDraftBidAmountFocused(
                                                                false,
                                                            )
                                                        }
                                                        onChange={(event) =>
                                                            handleDraftBidAmountChange(
                                                                parseAmountInput(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    />
                                                ) : (
                                                    formatMoney(item.bid_amount)
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {editedItem.rebate_enabled
                                                    ? formatMoney(
                                                          isEditing
                                                              ? editedFinalBidAmount
                                                              : item.final_bid_amount,
                                                      )
                                                    : formatMoney(
                                                          item.bid_amount,
                                                      )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <select
                                                        value={
                                                            editedItem.inspection_by ??
                                                            ''
                                                        }
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                'inspection_by',
                                                                event.target
                                                                    .value ===
                                                                    ''
                                                                    ? null
                                                                    : (event
                                                                          .target
                                                                          .value as InspectionBy),
                                                            )
                                                        }
                                                        className={
                                                            smallInputClass
                                                        }
                                                    >
                                                        <option value="">
                                                            Select
                                                        </option>
                                                        {INSPECTION_BY_OPTIONS.map(
                                                            (option) => (
                                                                <option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                ) : (
                                                    (item.inspection_by ?? '—')
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <PaymentStagesField
                                                    value={
                                                        editedItem.payment_stages
                                                    }
                                                    onChange={(stages) =>
                                                        updateDraft(
                                                            'payment_stages',
                                                            stages,
                                                        )
                                                    }
                                                    disabled={!isEditing}
                                                />
                                            </td>
                                            <td className="sticky right-0 bg-[var(--color-surface)]/95 px-3 py-3 text-center shadow-[-4px_0_8px_-8px_rgba(15,36,54,0.6)]">
                                                {isEditing ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                saveEditedItem
                                                            }
                                                            className="font-semibold text-[var(--color-status-gold-text)] hover:text-[var(--color-accent-2)]"
                                                        >
                                                            Done
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                cancelEditing
                                                            }
                                                            className="font-semibold text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                startEditing(
                                                                    index,
                                                                )
                                                            }
                                                            className="font-semibold text-[var(--color-status-orange-text)] hover:text-[var(--color-accent)]"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteItem(
                                                                    index,
                                                                )
                                                            }
                                                            className="font-semibold text-red-600 hover:text-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        {additionalRowErrors.length > 0 && (
                                            <tr className="border-t border-red-500/10 bg-red-500/5">
                                                <td
                                                    colSpan={19}
                                                    className="px-3 py-2 text-xs text-red-600"
                                                >
                                                    {additionalRowErrors.join(
                                                        ' ',
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {items.length > 0 && (
                <p className="mt-2 text-xs text-[var(--color-ink)]/55">
                    Use Edit or Delete for individual rows. Item changes are
                    stored when you save the LOA form.
                </p>
            )}
        </section>
    );
}
