import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/engineers';
import EngineerAdditionalTab from './engineer-additional-tab';
import EngineerBankingTab from './engineer-banking-tab';
import EngineerContactTab from './engineer-contact-tab';
import EngineerEmploymentTab from './engineer-employment-tab';
import { validateEngineerTab } from './engineer-form-fields';
import type {
    CityOption,
    EngineerFormData,
    EngineerTypeOption,
    StateOption,
} from './engineer-form-fields';
import EngineerIdentityTab from './engineer-identity-tab';
import EngineerPersonalTab from './engineer-personal-tab';
import EngineerStatutoryTab from './engineer-statutory-tab';
import EngineerTabs, { ENGINEER_TAB_ORDER } from './engineer-tabs';
import type { EngineerTabKey } from './engineer-tabs';

type EditEngineer = {
    unique_id: string;
    employee_code: string;
    full_name: string;
    gender: 'Male' | 'Female' | 'Other' | '';
    date_of_birth: string;
    blood_group: string | null;
    nationality: string | null;
    marital_status: string | null;
    mobile_number: string;
    alternate_mobile_number: string | null;
    official_email: string;
    personal_email: string | null;
    current_address: string;
    permanent_address: string;
    state_id: number | null;
    city_id: number | null;
    postal_code: string;
    aadhaar_number: string;
    pan_number: string;
    date_of_joining: string;
    employee_status: 'Active' | 'Retired' | 'Transferred';
    engineer_type_id: number;
    bank_name: string | null;
    branch_name: string | null;
    account_number: string | null;
    ifsc_code: string | null;
    pf_account_number: string | null;
    esi_account_number: string | null;
    languages_known: string[] | null;
};

type EditProps = {
    engineer: EditEngineer;
    engineerTypes: EngineerTypeOption[];
    states: StateOption[];
    cities: CityOption[];
    resumeTab: EngineerTabKey | null;
};

const tabFieldPrefixes: Record<EngineerTabKey, string[]> = {
    personal: [
        'full_name',
        'gender',
        'date_of_birth',
        'blood_group',
        'nationality',
        'marital_status',
    ],
    contact: [
        'mobile_number',
        'alternate_mobile_number',
        'official_email',
        'personal_email',
        'current_address',
        'permanent_address',
        'state_id',
        'city_id',
        'postal_code',
    ],
    identity: ['aadhaar_number', 'pan_number'],
    employment: ['date_of_joining', 'employee_status', 'engineer_type_id'],
    banking: [
        'bank_name',
        'branch_name',
        'account_number',
        'account_number_confirmation',
        'ifsc_code',
    ],
    statutory: ['pf_account_number', 'esi_account_number'],
    additional: ['languages_known'],
};

export default function EngineersEdit({
    engineer,
    engineerTypes,
    states,
    cities,
    resumeTab,
}: EditProps) {
    const { data, setData, put, transform, processing, errors, reset } =
        useForm<EngineerFormData>({
            full_name: engineer.full_name,
            gender: engineer.gender,
            date_of_birth: engineer.date_of_birth,
            blood_group: engineer.blood_group ?? '',
            nationality: engineer.nationality ?? '',
            marital_status: engineer.marital_status ?? '',
            mobile_number: engineer.mobile_number,
            alternate_mobile_number: engineer.alternate_mobile_number ?? '',
            official_email: engineer.official_email,
            personal_email: engineer.personal_email ?? '',
            current_address: engineer.current_address,
            permanent_address: engineer.permanent_address,
            state_id: engineer.state_id ?? '',
            city_id: engineer.city_id ?? '',
            postal_code: engineer.postal_code,
            aadhaar_number: engineer.aadhaar_number,
            pan_number: engineer.pan_number,
            date_of_joining: engineer.date_of_joining,
            employee_status: engineer.employee_status,
            engineer_type_id: engineer.engineer_type_id,
            bank_name: engineer.bank_name ?? '',
            branch_name: engineer.branch_name ?? '',
            account_number: engineer.account_number ?? '',
            account_number_confirmation: engineer.account_number ?? '',
            ifsc_code: engineer.ifsc_code ?? '',
            pf_account_number: engineer.pf_account_number ?? '',
            esi_account_number: engineer.esi_account_number ?? '',
            languages_known: engineer.languages_known ?? [],
        });

    const [activeTab, setActiveTab] = useState<EngineerTabKey>(
        resumeTab ?? ENGINEER_TAB_ORDER[0],
    );
    const [attemptedTabs, setAttemptedTabs] = useState<Set<EngineerTabKey>>(
        new Set(),
    );
    // resumeTab is only set right after a "Save & Continue" redirect — a
    // record opened directly from the list (already fully filled in) has no
    // resumeTab, so every tab starts unlocked for free navigation.
    const [furthestUnlockedIndex, setFurthestUnlockedIndex] = useState(() =>
        resumeTab
            ? ENGINEER_TAB_ORDER.indexOf(resumeTab)
            : ENGINEER_TAB_ORDER.length - 1,
    );

    const isLastTab =
        activeTab === ENGINEER_TAB_ORDER[ENGINEER_TAB_ORDER.length - 1];
    const isLocked = (tab: EngineerTabKey) =>
        ENGINEER_TAB_ORDER.indexOf(tab) > furthestUnlockedIndex;

    const hasError = (tab: EngineerTabKey) => {
        const prefixes = tabFieldPrefixes[tab];
        const hasServerError = Object.keys(errors).some((key) =>
            prefixes.some(
                (prefix) => key === prefix || key.startsWith(`${prefix}.`),
            ),
        );
        const hasClientError =
            attemptedTabs.has(tab) &&
            Object.keys(validateEngineerTab(tab, data)).length > 0;

        return hasServerError || hasClientError;
    };

    const stepErrors = attemptedTabs.has(activeTab)
        ? validateEngineerTab(activeTab, data)
        : {};
    const displayErrors = { ...errors, ...stepErrors };

    const saveAndContinue = () => {
        setAttemptedTabs((tabs) => new Set(tabs).add(activeTab));

        if (Object.keys(validateEngineerTab(activeTab, data)).length > 0) {
            return;
        }

        const nextIndex = ENGINEER_TAB_ORDER.indexOf(activeTab) + 1;

        transform((formData) => ({
            ...formData,
            current_step: activeTab,
            finish: false,
        }));
        put(update.url(engineer.unique_id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setFurthestUnlockedIndex((current) =>
                    Math.max(current, nextIndex),
                );
                setActiveTab(ENGINEER_TAB_ORDER[nextIndex]);
            },
        });
    };

    const finish = () => {
        transform((formData) => ({ ...formData, finish: true }));
        put(update.url(engineer.unique_id));
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (isLastTab) {
            finish();
        } else {
            saveAndContinue();
        }
    };

    const handleReset = () => {
        if (window.confirm('Discard changes and reset this form?')) {
            reset();
        }
    };

    return (
        <AdminLayout
            title="Edit Engineer"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / Settings / Engineer Master
                    </Link>
                    <span className="mx-1.5 text-[var(--color-ink)]/40">/</span>
                    <span className="font-semibold text-[var(--color-ink)]">
                        Edit
                    </span>
                </div>
            }
        >
            <form
                onSubmit={submit}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6"
            >
                <div className="mb-4 flex items-center justify-end">
                    <span className="text-xs font-medium text-[var(--color-accent)]">
                        * Mandatory Fields
                    </span>
                </div>

                <EngineerTabs
                    active={activeTab}
                    onChange={setActiveTab}
                    hasError={hasError}
                    isLocked={isLocked}
                />

                <EngineerPersonalTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    employeeCode={engineer.employee_code}
                    className={activeTab === 'personal' ? '' : 'hidden'}
                />

                <EngineerContactTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    states={states}
                    cities={cities}
                    className={activeTab === 'contact' ? '' : 'hidden'}
                />

                <EngineerIdentityTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    className={activeTab === 'identity' ? '' : 'hidden'}
                />

                <EngineerEmploymentTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    engineerTypes={engineerTypes}
                    className={activeTab === 'employment' ? '' : 'hidden'}
                />

                <EngineerBankingTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    className={activeTab === 'banking' ? '' : 'hidden'}
                />

                <EngineerStatutoryTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    className={activeTab === 'statutory' ? '' : 'hidden'}
                />

                <EngineerAdditionalTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    className={activeTab === 'additional' ? '' : 'hidden'}
                />

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing
                            ? 'Saving...'
                            : isLastTab
                              ? 'Finish'
                              : 'Save & Continue'}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-lg border border-[var(--color-gold)]/25 px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Reset
                    </button>
                    <Link
                        href={index.url()}
                        className="rounded-lg border border-[var(--color-gold)]/25 px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Cancel
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="rounded-lg border border-[var(--color-gold)]/25 px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Back
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
