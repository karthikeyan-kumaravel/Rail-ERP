import type { EngineerTabKey } from './engineer-tabs';

export type EngineerFormData = {
    full_name: string;
    gender: '' | 'Male' | 'Female' | 'Other';
    date_of_birth: string;
    blood_group: string;
    nationality: string;
    marital_status: string;
    mobile_number: string;
    alternate_mobile_number: string;
    official_email: string;
    personal_email: string;
    current_address: string;
    permanent_address: string;
    state_id: number | '';
    city_id: number | '';
    postal_code: string;
    aadhaar_number: string;
    pan_number: string;
    date_of_joining: string;
    employee_status: 'Active' | 'Retired' | 'Transferred';
    engineer_type_id: number | '';
    bank_name: string;
    branch_name: string;
    account_number: string;
    account_number_confirmation: string;
    ifsc_code: string;
    pf_account_number: string;
    esi_account_number: string;
    languages_known: string[];
};

export type StateOption = { id: number; name: string };
export type CityOption = { id: number; name: string; state_id: number };
export type EngineerTypeOption = { id: number; name: string };

/**
 * Shared setter signature threaded through every Engineer form tab, mirroring
 * the `setData` returned by Inertia's `useForm<EngineerFormData>()`.
 */
export type EngineerSetData = <K extends keyof EngineerFormData>(
    key: K,
    value: EngineerFormData[K],
) => void;

export type EngineerFormErrors = Partial<
    Record<keyof EngineerFormData, string>
>;

export const GENDERS = ['Male', 'Female', 'Other'] as const;
export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const EMPLOYEE_STATUSES = ['Active', 'Retired', 'Transferred'] as const;
export const LANGUAGE_OPTIONS = [
    'English',
    'Hindi',
    'Tamil',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Gujarati',
    'Bengali',
    'Punjabi',
    'Odia',
    'Assamese',
    'Urdu',
    'Sanskrit',
];

export const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
export const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40 disabled:cursor-not-allowed disabled:opacity-60';
export const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export function calculateAge(dateOfBirth: string): string {
    if (!dateOfBirth) {
        return '';
    }

    const dob = new Date(dateOfBirth);

    if (Number.isNaN(dob.getTime())) {
        return '';
    }

    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        years--;
    }

    return years >= 0 ? `${years} years` : '';
}

/**
 * The subset of each tab's fields that are actually required server-side
 * (see StoreEngineerRequest/UpdateEngineerRequest), used to gate the
 * "Save & Continue" step button with an early, tab-scoped check before the
 * real submit happens. Fields with a sensible non-empty default (e.g.
 * `employee_status`) are omitted since they can never trip this check.
 */
const REQUIRED_FIELDS_BY_TAB: Record<
    EngineerTabKey,
    Array<{ field: keyof EngineerFormData; label: string }>
> = {
    personal: [
        { field: 'full_name', label: 'Full Name' },
        { field: 'gender', label: 'Gender' },
        { field: 'date_of_birth', label: 'Date of Birth' },
    ],
    contact: [
        { field: 'mobile_number', label: 'Mobile Number' },
        { field: 'official_email', label: 'Official Email' },
        { field: 'current_address', label: 'Current Address' },
        { field: 'permanent_address', label: 'Permanent Address' },
        { field: 'postal_code', label: 'Postal Code' },
    ],
    identity: [
        { field: 'aadhaar_number', label: 'Aadhaar Number' },
        { field: 'pan_number', label: 'PAN Number' },
    ],
    employment: [
        { field: 'date_of_joining', label: 'Date of Joining' },
        { field: 'engineer_type_id', label: 'Engineer Type' },
    ],
    banking: [],
    statutory: [],
    additional: [],
};

/**
 * Client-side "is this tab's required data filled in" check, used by the
 * Save & Continue step button. This intentionally only checks presence, not
 * format (Aadhaar/PAN/IFSC regex etc.) — format validation still happens
 * authoritatively on the server when the form is actually submitted.
 */
export function validateEngineerTab(
    tab: EngineerTabKey,
    data: EngineerFormData,
): EngineerFormErrors {
    const errors: EngineerFormErrors = {};

    REQUIRED_FIELDS_BY_TAB[tab].forEach(({ field, label }) => {
        const value = data[field];

        if (value === '' || value === null || value === undefined) {
            errors[field] = `${label} is required.`;
        }
    });

    return errors;
}

export function defaultEngineerFormData(): EngineerFormData {
    return {
        full_name: '',
        gender: '',
        date_of_birth: '',
        blood_group: '',
        nationality: '',
        marital_status: '',
        mobile_number: '',
        alternate_mobile_number: '',
        official_email: '',
        personal_email: '',
        current_address: '',
        permanent_address: '',
        state_id: '',
        city_id: '',
        postal_code: '',
        aadhaar_number: '',
        pan_number: '',
        date_of_joining: '',
        employee_status: 'Active',
        engineer_type_id: '',
        bank_name: '',
        branch_name: '',
        account_number: '',
        account_number_confirmation: '',
        ifsc_code: '',
        pf_account_number: '',
        esi_account_number: '',
        languages_known: [],
    };
}
