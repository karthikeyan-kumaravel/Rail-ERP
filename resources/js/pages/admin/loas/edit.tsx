import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/loas';
import LoaDetailsTab from './loa-details-tab';
import LoaFinancialSecurityTab from './loa-financial-security-tab';
import {
    FINANCIAL_SECURITY_TYPES,
    scrollToFirstError,
    validateLoaTab,
} from './loa-form-fields';
import type {
    BankOption,
    DivisionOption,
    EngineerTypeOption,
    FinancialSecuritiesExisting,
    FinancialSecuritiesFormData,
    FinancialSecurityType,
    LoaFormData,
    LoaFormErrors,
    LoaItemFormData,
    LoaStationFormData,
    LoaTeamMemberFormData,
    ScheduleNameOption,
    ScheduleTypeOption,
    StationOption,
    UnitOption,
    VendorOption,
} from './loa-form-fields';
import LoaItemDetailsTab from './loa-item-details-tab';
import LoaProjectTeamTab from './loa-project-team-tab';
import LoaScopeOfWorkTab from './loa-scope-of-work-tab';
import LoaTabs, { LOA_TAB_ORDER } from './loa-tabs';
import type { LoaTabKey } from './loa-tabs';

const tabFieldPrefixes: Record<LoaTabKey, string[]> = {
    details: [
        'loa_number',
        'client',
        'vendor_id',
        'division_id',
        'work_type',
        'contract_value_amount',
        'contract_value_unit',
        'completion_period_months',
        'defect_liability_months',
        'start_date',
        'end_date',
        'total_stations',
        'active_status',
        'stations',
    ],
    items: ['items'],
    financial: ['financial_securities'],
    team: ['team'],
    scope: ['scope_of_work'],
};

type EditFinancialSecurity = {
    amount: number | null;
    amount_unit: 'Cr' | 'L';
    validity_start_date: string | null;
    validity_end_date: string | null;
    claim_period: number | null;
    claim_period_unit: 'Days' | 'Months';
    bank_id: number | null;
    existing_file_url: string | null;
    existing_file_name: string | null;
};

type EditTeamMember = {
    engineer_id: number | null;
    engineer_type_id: number | null;
    name: string;
    role: string;
};

type EditLoa = {
    unique_id: string;
    loa_number: string;
    loa_date: string | null;
    client: string;
    vendor_id: number | null;
    division_id: number;
    schedule_name_id: number | null;
    schedule_type_id: number | null;
    work_type: string;
    contract_value_amount: number;
    contract_value_unit: 'Cr' | 'L';
    completion_period_months: number;
    defect_liability_months: number;
    start_date: string;
    end_date: string;
    total_stations: number;
    completion_date: string | null;
    extension_date: string | null;
    scope_of_work: string;
    active_status: boolean;
    team: EditTeamMember[];
    items: LoaItemFormData[];
    stations: LoaStationFormData[];
    financial_securities: Record<FinancialSecurityType, EditFinancialSecurity>;
};

function toTeamFormData(team: EditTeamMember[]): LoaTeamMemberFormData[] {
    if (team.length === 0) {
        return [{ engineer_id: '', engineer_type_id: '', name: '', role: '' }];
    }

    return team.map((member) => ({
        engineer_id: member.engineer_id ?? '',
        engineer_type_id: member.engineer_type_id ?? '',
        name: member.name,
        role: member.role,
    }));
}

type EditProps = {
    loa: EditLoa;
    divisions: DivisionOption[];
    scheduleNames: ScheduleNameOption[];
    scheduleTypes: ScheduleTypeOption[];
    vendors: VendorOption[];
    stations: StationOption[];
    units: UnitOption[];
    banks: BankOption[];
    engineerTypes: EngineerTypeOption[];
    resumeTab: LoaTabKey | null;
};

function toFinancialSecuritiesFormData(
    loaFinancialSecurities: EditLoa['financial_securities'],
): FinancialSecuritiesFormData {
    return FINANCIAL_SECURITY_TYPES.reduce((sections, type) => {
        const record = loaFinancialSecurities[type];

        return {
            ...sections,
            [type]: {
                amount: record.amount ?? '',
                amount_unit: record.amount_unit,
                validity_start_date: record.validity_start_date ?? '',
                validity_end_date: record.validity_end_date ?? '',
                claim_period: record.claim_period ?? '',
                claim_period_unit: record.claim_period_unit,
                bank_id: record.bank_id ?? '',
                file: null,
                remove_file: false,
            },
        };
    }, {} as FinancialSecuritiesFormData);
}

function toFinancialSecuritiesExisting(
    loaFinancialSecurities: EditLoa['financial_securities'],
): FinancialSecuritiesExisting {
    return FINANCIAL_SECURITY_TYPES.reduce((sections, type) => {
        const record = loaFinancialSecurities[type];

        return {
            ...sections,
            [type]: {
                existing_file_url: record.existing_file_url,
                existing_file_name: record.existing_file_name,
            },
        };
    }, {} as FinancialSecuritiesExisting);
}

export default function LoasEdit({
    loa,
    divisions,
    scheduleNames,
    scheduleTypes,
    vendors,
    stations,
    units,
    banks,
    engineerTypes,
    resumeTab,
}: EditProps) {
    const { data, setData, post, transform, processing, errors } =
        useForm<LoaFormData>({
            loa_number: loa.loa_number,
            loa_date: loa.loa_date ?? '',
            client: loa.client,
            vendor_id: loa.vendor_id ?? '',
            division_id: loa.division_id,
            schedule_name_id: loa.schedule_name_id ?? '',
            schedule_type_id: loa.schedule_type_id ?? '',
            work_type: loa.work_type,
            contract_value_amount: loa.contract_value_amount,
            contract_value_unit: loa.contract_value_unit,
            completion_period_months: loa.completion_period_months,
            defect_liability_months: loa.defect_liability_months,
            start_date: loa.start_date,
            end_date: loa.end_date,
            total_stations: loa.total_stations,
            completion_date: loa.completion_date ?? '',
            extension_date: loa.extension_date ?? '',
            scope_of_work: loa.scope_of_work,
            active_status: loa.active_status ? '1' : '0',
            team: toTeamFormData(loa.team),
            items: loa.items ?? [],
            stations: loa.stations ?? [],
            financial_securities: toFinancialSecuritiesFormData(
                loa.financial_securities,
            ),
        });

    const existingFinancialSecurities = toFinancialSecuritiesExisting(
        loa.financial_securities,
    );

    const [activeTab, setActiveTab] = useState<LoaTabKey>(
        resumeTab ?? LOA_TAB_ORDER[0],
    );
    const [attemptedTabs, setAttemptedTabs] = useState<Set<LoaTabKey>>(
        new Set(),
    );
    // resumeTab is only set right after a "Save & Continue" redirect — an
    // LOA opened directly from the list (already fully filled in) has no
    // resumeTab, so every tab starts unlocked for free navigation.
    const [furthestUnlockedIndex, setFurthestUnlockedIndex] = useState(() =>
        resumeTab ? LOA_TAB_ORDER.indexOf(resumeTab) : LOA_TAB_ORDER.length - 1,
    );

    const isLastTab = activeTab === LOA_TAB_ORDER[LOA_TAB_ORDER.length - 1];
    const isLocked = (tab: LoaTabKey) =>
        LOA_TAB_ORDER.indexOf(tab) > furthestUnlockedIndex;

    const hasError = (tab: LoaTabKey) => {
        const prefixes = tabFieldPrefixes[tab];
        const hasServerError = Object.keys(errors).some((key) =>
            prefixes.some(
                (prefix) => key === prefix || key.startsWith(`${prefix}.`),
            ),
        );
        const hasClientError =
            attemptedTabs.has(tab) &&
            Object.keys(validateLoaTab(tab, data)).length > 0;

        return hasServerError || hasClientError;
    };

    const stepErrors = attemptedTabs.has(activeTab)
        ? validateLoaTab(activeTab, data)
        : {};
    // `stepErrors` is spread after `errors` so a fresh client check for a
    // field supersedes a now-stale server message for that *same* field —
    // without discarding every other server error under the active tab's
    // prefix. Blanket-stripping by prefix (the previous approach) silently
    // dropped server-only rules the client can't replicate (e.g. the
    // Financial Security document requirement): the red dot still lit up
    // from the raw `errors`, but no message ever reached the screen.
    const displayErrors: LoaFormErrors = { ...errors, ...stepErrors };

    const addTeamMember = () => {
        setData('team', [
            ...data.team,
            { engineer_id: '', engineer_type_id: '', name: '', role: '' },
        ]);
    };

    const removeTeamMember = (index: number) => {
        if (data.team.length <= 1) {
            return;
        }

        setData(
            'team',
            data.team.filter((_, i) => i !== index),
        );
    };

    const updateTeamMember = (
        index: number,
        patch: Partial<LoaTeamMemberFormData>,
    ) => {
        setData(
            'team',
            data.team.map((member, i) =>
                i === index ? { ...member, ...patch } : member,
            ),
        );
    };

    /**
     * Jumps to the earliest tab (in wizard order) that a server error
     * belongs to, so a `finish()` failure never leaves the user stranded on
     * a tab whose content doesn't include the field that actually failed.
     */
    const revealServerErrors = (formErrors: LoaFormErrors) => {
        const erroredTab = LOA_TAB_ORDER.find((tab) =>
            tabFieldPrefixes[tab].some((prefix) =>
                Object.keys(formErrors).some(
                    (key) => key === prefix || key.startsWith(`${prefix}.`),
                ),
            ),
        );

        if (erroredTab) {
            setAttemptedTabs((tabs) => new Set(tabs).add(erroredTab));
            setFurthestUnlockedIndex((current) =>
                Math.max(current, LOA_TAB_ORDER.indexOf(erroredTab)),
            );
            setActiveTab(erroredTab);
        }

        console.warn('LOA save failed validation:', formErrors);
        window.setTimeout(() => scrollToFirstError(formErrors), 50);
    };

    const saveAndContinue = () => {
        setAttemptedTabs((tabs) => new Set(tabs).add(activeTab));

        const clientErrors = validateLoaTab(activeTab, data);

        if (Object.keys(clientErrors).length > 0) {
            window.setTimeout(() => scrollToFirstError(clientErrors), 50);

            return;
        }

        const nextIndex = LOA_TAB_ORDER.indexOf(activeTab) + 1;

        // Laravel/PHP never populates $_POST/$_FILES for a literal PUT
        // request, even when its body is multipart/form-data — only POST
        // gets parsed that way. Inertia doesn't auto-spoof this (unlike a
        // plain HTML form with @method('PUT')), so a real `put()` call here
        // would silently ship an empty body the instant any Financial
        // Security file input holds a File, and every `required` rule fails
        // at once. Sending as `post()` with `_method: 'put'` is the
        // documented Inertia/Laravel pattern for this exact situation —
        // Laravel treats it as the PUT route, PHP parses the body normally.
        transform((formData) => ({
            ...formData,
            current_step: activeTab,
            finish: false,
            _method: 'put',
        }));
        post(update.url(loa.unique_id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setFurthestUnlockedIndex((current) =>
                    Math.max(current, nextIndex),
                );
                setActiveTab(LOA_TAB_ORDER[nextIndex]);
            },
            onError: revealServerErrors,
        });
    };

    const finish = () => {
        transform((formData) => ({
            ...formData,
            finish: true,
            _method: 'put',
        }));
        post(update.url(loa.unique_id), {
            onError: revealServerErrors,
        });
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (isLastTab) {
            finish();
        } else {
            saveAndContinue();
        }
    };

    return (
        <AdminLayout
            title="Edit LOA / PO"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / LOA / PO Management
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

                <LoaTabs
                    active={activeTab}
                    onChange={setActiveTab}
                    hasError={hasError}
                    isLocked={isLocked}
                />

                <LoaDetailsTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    divisions={divisions}
                    vendors={vendors}
                    stations={stations}
                    className={activeTab === 'details' ? '' : 'hidden'}
                />

                <LoaItemDetailsTab
                    data={data}
                    errors={displayErrors}
                    scheduleNames={scheduleNames}
                    scheduleTypes={scheduleTypes}
                    units={units}
                    onItemsChange={(items) => setData('items', items)}
                    className={activeTab === 'items' ? '' : 'hidden'}
                />

                <LoaFinancialSecurityTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    banks={banks}
                    existing={existingFinancialSecurities}
                    className={activeTab === 'financial' ? '' : 'hidden'}
                />

                <LoaProjectTeamTab
                    data={data}
                    errors={displayErrors}
                    engineerTypes={engineerTypes}
                    addTeamMember={addTeamMember}
                    removeTeamMember={removeTeamMember}
                    updateTeamMember={updateTeamMember}
                    className={activeTab === 'team' ? '' : 'hidden'}
                />

                <LoaScopeOfWorkTab
                    data={data}
                    setData={setData}
                    errors={displayErrors}
                    className={activeTab === 'scope' ? '' : 'hidden'}
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
                    <Link
                        href={index.url()}
                        className="rounded-lg border border-[var(--color-gold)]/25 px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
