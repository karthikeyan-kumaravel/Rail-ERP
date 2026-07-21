import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/loas';
import LoaDetailsTab from './loa-details-tab';
import LoaFinancialSecurityTab from './loa-financial-security-tab';
import { validateLoaTab } from './loa-form-fields';
import type {
    DivisionOption,
    LoaFormData,
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
    financial: [
        'bg_amount',
        'bg_amount_unit',
        'bg_validity',
        'security_deposit_amount',
        'security_deposit_unit',
        'mobilization_advance_amount',
        'mobilization_advance_unit',
        'mobilization_advance_status',
    ],
    team: ['team'],
    scope: ['scope_of_work'],
};

type EditLoa = {
    unique_id: string;
    loa_number: string;
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
    bg_amount: number;
    bg_amount_unit: 'Cr' | 'L';
    bg_validity: string;
    security_deposit_amount: number;
    security_deposit_unit: 'Cr' | 'L';
    mobilization_advance_amount: number;
    mobilization_advance_unit: 'Cr' | 'L';
    mobilization_advance_status: 'Pending' | 'Requested' | 'Received';
    scope_of_work: string;
    active_status: boolean;
    team: LoaTeamMemberFormData[];
    items: LoaItemFormData[];
    stations: LoaStationFormData[];
};

type EditProps = {
    loa: EditLoa;
    divisions: DivisionOption[];
    scheduleNames: ScheduleNameOption[];
    scheduleTypes: ScheduleTypeOption[];
    vendors: VendorOption[];
    stations: StationOption[];
    units: UnitOption[];
    resumeTab: LoaTabKey | null;
};

export default function LoasEdit({
    loa,
    divisions,
    scheduleNames,
    scheduleTypes,
    vendors,
    stations,
    units,
    resumeTab,
}: EditProps) {
    const { data, setData, put, transform, processing, errors } =
        useForm<LoaFormData>({
            loa_number: loa.loa_number,
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
            bg_amount: loa.bg_amount,
            bg_amount_unit: loa.bg_amount_unit,
            bg_validity: loa.bg_validity,
            security_deposit_amount: loa.security_deposit_amount,
            security_deposit_unit: loa.security_deposit_unit,
            mobilization_advance_amount: loa.mobilization_advance_amount,
            mobilization_advance_unit: loa.mobilization_advance_unit,
            mobilization_advance_status: loa.mobilization_advance_status,
            scope_of_work: loa.scope_of_work,
            active_status: loa.active_status ? '1' : '0',
            team: loa.team.length > 0 ? loa.team : [{ name: '', role: '' }],
            items: loa.items ?? [],
            stations: loa.stations ?? [],
        });

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
    const displayErrors = { ...errors, ...stepErrors };

    const addTeamMember = () => {
        setData('team', [...data.team, { name: '', role: '' }]);
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
        field: keyof LoaTeamMemberFormData,
        value: string,
    ) => {
        setData(
            'team',
            data.team.map((member, i) =>
                i === index ? { ...member, [field]: value } : member,
            ),
        );
    };

    const saveAndContinue = () => {
        setAttemptedTabs((tabs) => new Set(tabs).add(activeTab));

        if (Object.keys(validateLoaTab(activeTab, data)).length > 0) {
            return;
        }

        const nextIndex = LOA_TAB_ORDER.indexOf(activeTab) + 1;

        transform((formData) => ({
            ...formData,
            current_step: activeTab,
            finish: false,
        }));
        put(update.url(loa.unique_id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setFurthestUnlockedIndex((current) =>
                    Math.max(current, nextIndex),
                );
                setActiveTab(LOA_TAB_ORDER[nextIndex]);
            },
        });
    };

    const finish = () => {
        transform((formData) => ({ ...formData, finish: true }));
        put(update.url(loa.unique_id));
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
                    className={activeTab === 'financial' ? '' : 'hidden'}
                />

                <LoaProjectTeamTab
                    data={data}
                    errors={displayErrors}
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
