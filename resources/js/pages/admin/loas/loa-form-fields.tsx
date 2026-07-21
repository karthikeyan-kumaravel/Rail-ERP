import type { LoaTabKey } from './loa-tabs';

export type LoaTeamMemberFormData = {
    name: string;
    role: string;
};

export type LoaStationFormData = {
    station_id: number | '';
};

export type BidRateUnit = '% Above' | '% Below';

/**
 * Text color for a Bid Rate's "% Above"/"% Below" line: red for an
 * over-estimate bid, green for a favorable under-estimate one, muted when
 * at par. Shared by the LOA view page's Bid Rate column.
 */
export function bidRateUnitTextClass(unit: BidRateUnit | null): string {
    if (unit === '% Above') {
        return 'text-red-600';
    }

    if (unit === '% Below') {
        return 'text-green-600';
    }

    return 'text-[var(--color-ink)]/55';
}

export type InspectionBy = 'RITES' | 'RDSO' | 'Consignee';

export type PaymentPercentage = '5%' | '20%' | '70%' | '90%';

export const PAYMENT_PERCENTAGE_OPTIONS: PaymentPercentage[] = [
    '5%',
    '20%',
    '70%',
    '90%',
];

/**
 * The LOA item's payment stages — single source of truth for this feature,
 * shared by the payment configuration popup, its trigger/badge display, and
 * the LoaItemFormData shape below. Add a future stage here only.
 */
export type PaymentStageKey =
    'Supply' | 'Supply & Installation' | 'Commissioning' | 'Final Payment';

export const PAYMENT_STAGE_KEYS: PaymentStageKey[] = [
    'Supply',
    'Supply & Installation',
    'Commissioning',
    'Final Payment',
];

export const PAYMENT_STAGE_SHORT_LABELS: Record<PaymentStageKey, string> = {
    Supply: 'Supply',
    'Supply & Installation': 'Supply & Install',
    Commissioning: 'Commission',
    'Final Payment': 'Final',
};

/**
 * Each stage's tone (badge border/background/text) in the payment pattern
 * bar — color is always paired with the stage's short label and percentage,
 * never the sole signal.
 */
export const PAYMENT_STAGE_TONE_CLASS: Record<PaymentStageKey, string> = {
    Supply: 'border-blue-500/35 bg-blue-500/10 text-blue-700',
    'Supply & Installation':
        'border-purple-500/35 bg-purple-500/10 text-purple-700',
    Commissioning: 'border-teal-500/35 bg-teal-500/10 text-teal-700',
    'Final Payment': 'border-amber-500/35 bg-amber-500/10 text-amber-700',
};

export type PaymentStages = Partial<Record<PaymentStageKey, PaymentPercentage>>;

/** Sums whichever stages are configured; unset stages don't count. */
export function sumPaymentStages(stages: PaymentStages | null): number {
    if (!stages) {
        return 0;
    }

    return PAYMENT_STAGE_KEYS.reduce((total, key) => {
        const value = stages[key];

        return total + (value ? Number(value.replace('%', '')) : 0);
    }, 0);
}

export type LoaItemFormData = {
    schedule_name_id: number | '';
    schedule_type_id: number | '';
    schedule_name: string | null;
    schedule_advertised_value: number | string | null;
    item_no: string;
    item_description: string;
    item_code: string | null;
    item_quantity: number | string;
    quantity_unit: string;
    unit_rate: number | string;
    escalation: number | string | null;
    advertised_value: number | string;
    bid_rate: number | string;
    bid_rate_unit: BidRateUnit | null;
    bid_percentage_value: number | string | null;
    bid_amount: number | string;
    inspection_by: InspectionBy | null;
    payment_stages: PaymentStages | null;
};

export type LoaFormData = {
    loa_number: string;
    client: string;
    vendor_id: number | '';
    division_id: number | '';
    schedule_name_id: number | '';
    schedule_type_id: number | '';
    work_type: string;
    contract_value_amount: number | '';
    contract_value_unit: 'Cr' | 'L';
    completion_period_months: number | '';
    defect_liability_months: number | '';
    start_date: string;
    end_date: string;
    total_stations: number | '';
    bg_amount: number | '';
    bg_amount_unit: 'Cr' | 'L';
    bg_validity: string;
    security_deposit_amount: number | '';
    security_deposit_unit: 'Cr' | 'L';
    mobilization_advance_amount: number | '';
    mobilization_advance_unit: 'Cr' | 'L';
    mobilization_advance_status: 'Pending' | 'Requested' | 'Received';
    scope_of_work: string;
    active_status: '1' | '0';
    team: LoaTeamMemberFormData[];
    items: LoaItemFormData[];
    stations: LoaStationFormData[];
};

export type DivisionOption = { id: number; name: string };
export type VendorOption = { id: number; name: string };
export type UnitOption = { id: number; name: string };
export type ScheduleNameOption = { id: number; name: string };
export type ScheduleTypeOption = {
    id: number;
    name: string;
    schedule_name_id: number;
};
export type StationOption = {
    id: number;
    name: string;
    division_id: number;
};

/**
 * Shared setter signature threaded through every LOA form tab, mirroring the
 * `setData` returned by Inertia's `useForm<LoaFormData>()`.
 */
export type LoaSetData = <K extends keyof LoaFormData>(
    key: K,
    value: LoaFormData[K],
) => void;

/**
 * Inertia represents nested array errors with dot-notation keys such as
 * `team.0.name`. We accept a loosely typed string-keyed error map so every
 * tab can index into it with template strings.
 */
export type LoaFormErrors = Record<string, string | undefined>;

export const unitOptions: Array<'Cr' | 'L'> = ['Cr', 'L'];

export const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
export const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40 disabled:cursor-not-allowed disabled:opacity-60';
export const unitSelectClass =
    'w-24 shrink-0 rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-2 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
export const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

/**
 * The subset of each tab's fields that are actually required server-side
 * (see StoreLoaRequest/UpdateLoaRequest), used to gate the "Save & Continue"
 * step button with an early, tab-scoped check before the real submit
 * happens. Fields with a sensible non-empty default (units, statuses,
 * active_status) are omitted since they can never trip this check. The
 * `team` tab is validated separately below since it's a repeatable group.
 */
const REQUIRED_FIELDS_BY_TAB: Record<
    LoaTabKey,
    Array<{ field: keyof LoaFormData; label: string }>
> = {
    details: [
        { field: 'loa_number', label: 'LOA Number' },
        { field: 'client', label: 'Client' },
        { field: 'division_id', label: 'Division' },
        { field: 'work_type', label: 'Work Type' },
        { field: 'contract_value_amount', label: 'Contract Value' },
        { field: 'completion_period_months', label: 'Completion Period' },
        { field: 'defect_liability_months', label: 'Defect Liability' },
        { field: 'start_date', label: 'Start Date' },
        { field: 'end_date', label: 'End Date' },
        { field: 'total_stations', label: 'Total Stations' },
    ],
    items: [],
    financial: [
        { field: 'bg_amount', label: 'BG Amount' },
        { field: 'bg_validity', label: 'BG Validity' },
        { field: 'security_deposit_amount', label: 'Security Deposit' },
        {
            field: 'mobilization_advance_amount',
            label: 'Mobilization Advance',
        },
    ],
    team: [],
    scope: [{ field: 'scope_of_work', label: 'Scope of Work' }],
};

/**
 * Client-side "is this tab's required data filled in" check, used by the
 * Save & Continue step button. This intentionally only checks presence, not
 * cross-field rules (e.g. end date on/after start date) — those still get
 * validated authoritatively on the server when the form is actually
 * submitted.
 */
export function validateLoaTab(
    tab: LoaTabKey,
    data: LoaFormData,
): LoaFormErrors {
    const errors: LoaFormErrors = {};

    if (tab === 'team') {
        data.team.forEach((member, index) => {
            if (!member.name.trim()) {
                errors[`team.${index}.name`] = 'Name is required.';
            }

            if (!member.role.trim()) {
                errors[`team.${index}.role`] = 'Role is required.';
            }
        });

        return errors;
    }

    REQUIRED_FIELDS_BY_TAB[tab].forEach(({ field, label }) => {
        const value = data[field];

        if (value === '' || value === null || value === undefined) {
            errors[field] = `${label} is required.`;
        }
    });

    return errors;
}

export function defaultLoaFormData(): LoaFormData {
    return {
        loa_number: '',
        client: '',
        vendor_id: '',
        division_id: '',
        schedule_name_id: '',
        schedule_type_id: '',
        work_type: '',
        contract_value_amount: '',
        contract_value_unit: 'Cr',
        completion_period_months: '',
        defect_liability_months: '',
        start_date: '',
        end_date: '',
        total_stations: '',
        bg_amount: '',
        bg_amount_unit: 'L',
        bg_validity: '',
        security_deposit_amount: '',
        security_deposit_unit: 'L',
        mobilization_advance_amount: '',
        mobilization_advance_unit: 'L',
        mobilization_advance_status: 'Pending',
        scope_of_work: '',
        active_status: '1',
        team: [{ name: '', role: '' }],
        items: [],
        stations: [],
    };
}
