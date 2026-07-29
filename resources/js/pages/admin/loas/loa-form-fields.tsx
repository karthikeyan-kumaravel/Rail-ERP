import type { LoaTabKey } from './loa-tabs';

export type LoaTeamMemberFormData = {
    engineer_id: number | '';
    engineer_type_id: number | '';
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

export type ItemCategory = 'Supply' | 'Supply & Installation' | 'Commissioning';

export const ITEM_CATEGORY_OPTIONS: ItemCategory[] = [
    'Supply',
    'Supply & Installation',
    'Commissioning',
];

export type BidValueType = 'At Per' | 'Below %' | 'Above %';

export const BID_VALUE_TYPE_OPTIONS: BidValueType[] = [
    'At Per',
    'Below %',
    'Above %',
];

/** `bid_rate_unit`'s stored `null`/`'% Above'`/`'% Below'` shape, made editable as a 3-option dropdown. */
export function bidValueTypeFromRateUnit(
    unit: BidRateUnit | null,
): BidValueType {
    if (unit === '% Above') {
        return 'Above %';
    }

    if (unit === '% Below') {
        return 'Below %';
    }

    return 'At Per';
}

export function rateUnitFromBidValueType(
    type: BidValueType,
): BidRateUnit | null {
    if (type === 'Above %') {
        return '% Above';
    }

    if (type === 'Below %') {
        return '% Below';
    }

    return null;
}

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
    item_category: ItemCategory | null;
    specialization_file: File | null;
    specialization_existing_file_url: string | null;
    specialization_existing_file_name: string | null;
    remove_specialization_file: boolean;
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
    rebate_enabled: boolean;
    rebate_percentage: number | string;
    rebate_amount: number | string;
    final_bid_amount: number | string;
    inspection_by: InspectionBy | null;
    payment_stages: PaymentStages | null;
};

export type FinancialSecurityType = 'emd' | 'performance_bg' | 'security_bg';

export const FINANCIAL_SECURITY_TYPES: FinancialSecurityType[] = [
    'emd',
    'performance_bg',
    'security_bg',
];

/**
 * Performance BG and Security BG are optional — only EMD is a mandatory
 * financial security, so it's the only type checked by `validateLoaTab`.
 */
const FINANCIAL_SECURITY_REQUIRED_TYPES: FinancialSecurityType[] = ['emd'];

export const FINANCIAL_SECURITY_LABELS: Record<FinancialSecurityType, string> =
    {
        emd: 'EMD Details',
        performance_bg: 'Performance Bank Guarantee',
        security_bg: 'Security Bank Guarantee',
    };

export type FinancialSecuritySectionFormData = {
    amount: number | '';
    amount_unit: 'Cr' | 'L';
    validity_start_date: string;
    validity_end_date: string;
    claim_period: number | '';
    claim_period_unit: 'Days' | 'Months';
    bank_id: number | '';
    file: File | null;
    remove_file: boolean;
};

export type FinancialSecuritiesFormData = Record<
    FinancialSecurityType,
    FinancialSecuritySectionFormData
>;

export type FinancialSecurityExisting = {
    existing_file_url: string | null;
    existing_file_name: string | null;
};

export type FinancialSecuritiesExisting = Record<
    FinancialSecurityType,
    FinancialSecurityExisting
>;

export function defaultFinancialSecuritySection(): FinancialSecuritySectionFormData {
    return {
        amount: '',
        amount_unit: 'L',
        validity_start_date: '',
        validity_end_date: '',
        claim_period: '',
        claim_period_unit: 'Days',
        bank_id: '',
        file: null,
        remove_file: false,
    };
}

export function defaultFinancialSecurities(): FinancialSecuritiesFormData {
    return {
        emd: defaultFinancialSecuritySection(),
        performance_bg: defaultFinancialSecuritySection(),
        security_bg: defaultFinancialSecuritySection(),
    };
}

export type LoaFormData = {
    loa_number: string;
    loa_date: string;
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
    completion_date: string;
    extension_date: string;
    scope_of_work: string;
    active_status: '1' | '0';
    team: LoaTeamMemberFormData[];
    items: LoaItemFormData[];
    stations: LoaStationFormData[];
    financial_securities: FinancialSecuritiesFormData;
};

export type DivisionOption = { id: number; name: string };
export type VendorOption = { id: number; name: string };
export type UnitOption = { id: number; name: string };
export type BankOption = { id: number; name: string };
export type EngineerTypeOption = { id: number; name: string };
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
    financial: [],
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
            if (member.engineer_id === '') {
                errors[`team.${index}.engineer_id`] = 'Name is required.';
            }

            if (member.engineer_type_id === '') {
                errors[`team.${index}.engineer_type_id`] = 'Role is required.';
            }
        });

        return errors;
    }

    if (tab === 'financial') {
        FINANCIAL_SECURITY_REQUIRED_TYPES.forEach((type) => {
            const section = data.financial_securities[type];
            const label = FINANCIAL_SECURITY_LABELS[type];

            if (section.amount === '') {
                errors[`financial_securities.${type}.amount`] =
                    `${label}: amount is required.`;
            }

            if (!section.validity_start_date) {
                errors[`financial_securities.${type}.validity_start_date`] =
                    `${label}: BG validity start date is required.`;
            }

            if (!section.validity_end_date) {
                errors[`financial_securities.${type}.validity_end_date`] =
                    `${label}: BG validity end date is required.`;
            }

            if (section.claim_period === '') {
                errors[`financial_securities.${type}.claim_period`] =
                    `${label}: claim period is required.`;
            }

            if (section.bank_id === '') {
                errors[`financial_securities.${type}.bank_id`] =
                    `${label}: bank is required.`;
            }
        });
    }

    REQUIRED_FIELDS_BY_TAB[tab].forEach(({ field, label }) => {
        const value = data[field];

        if (value === '' || value === null || value === undefined) {
            errors[field] = `${label} is required.`;
        }
    });

    return errors;
}

/**
 * Focuses and scrolls to the first invalid field, matched by DOM `id`
 * against the first key in `errors` (object key order is insertion order,
 * so this is "first" in whatever order the caller assembled the errors).
 * A no-op if no element has a matching id — not every field in the wizard
 * carries one yet, so this degrades silently rather than throwing.
 */
export function scrollToFirstError(errors: LoaFormErrors): void {
    const firstErrorKey = Object.keys(errors)[0];

    if (!firstErrorKey) {
        return;
    }

    const field = document.getElementById(firstErrorKey);

    if (!field) {
        return;
    }

    field.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (field instanceof HTMLElement && typeof field.focus === 'function') {
        field.focus({ preventScroll: true });
    }
}

export function defaultLoaFormData(): LoaFormData {
    return {
        loa_number: '',
        loa_date: '',
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
        completion_date: '',
        extension_date: '',
        scope_of_work: '',
        active_status: '1',
        team: [{ engineer_id: '', engineer_type_id: '', name: '', role: '' }],
        items: [],
        stations: [],
        financial_securities: defaultFinancialSecurities(),
    };
}
