import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/loas';
import LoaDetailsTab from './loa-details-tab';
import LoaFinancialSecurityTab from './loa-financial-security-tab';
import {
    defaultLoaFormData,
    scrollToFirstError,
    validateLoaTab,
} from './loa-form-fields';
import type {
    BankOption,
    DivisionOption,
    EngineerTypeOption,
    LoaFormData,
    LoaFormErrors,
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

// The field surface each tab renders — mirrored from edit.tsx — used to
// tell whether a server error belongs to a given tab (only 'details' is
// ever reachable on this page today, but every tab is listed for parity
// with edit.tsx and in case that changes).
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

type CreateProps = {
    divisions: DivisionOption[];
    scheduleNames: ScheduleNameOption[];
    scheduleTypes: ScheduleTypeOption[];
    vendors: VendorOption[];
    stations: StationOption[];
    units: UnitOption[];
    banks: BankOption[];
    engineerTypes: EngineerTypeOption[];
};

export default function LoasCreate({
    divisions,
    scheduleNames,
    scheduleTypes,
    vendors,
    stations,
    units,
    banks,
    engineerTypes,
}: CreateProps) {
    const { data, setData, post, transform, processing, errors, reset } =
        useForm<LoaFormData>(defaultLoaFormData());

    const [activeTab, setActiveTab] = useState<LoaTabKey>(LOA_TAB_ORDER[0]);
    const [attemptedTabs, setAttemptedTabs] = useState<Set<LoaTabKey>>(
        new Set(),
    );

    // Nothing has been persisted yet on the create page, so only the very
    // first tab is reachable — the rest unlock once the record exists (on
    // the edit page) and each preceding tab has been saved.
    const isLocked = (tab: LoaTabKey) => LOA_TAB_ORDER.indexOf(tab) > 0;

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
    // field supersedes a now-stale server message for that *same* field,
    // without discarding every other server error under the active tab's
    // prefix (blanket-stripping by prefix silently drops server-only rules
    // the client can't replicate, e.g. the Financial Security document
    // requirement — see edit.tsx for the full explanation).
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

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        setAttemptedTabs((tabs) => new Set(tabs).add(activeTab));

        const clientErrors = validateLoaTab(activeTab, data);

        if (Object.keys(clientErrors).length > 0) {
            window.setTimeout(() => scrollToFirstError(clientErrors), 50);

            return;
        }

        transform((formData) => ({
            ...formData,
            current_step: activeTab,
            finish: false,
        }));
        post(store.url(), {
            preserveScroll: true,
            onError: (formErrors) => {
                console.warn('LOA save failed validation:', formErrors);
                window.setTimeout(() => scrollToFirstError(formErrors), 50);
            },
        });
    };

    const handleReset = () => {
        if (window.confirm('Reset all fields in this form?')) {
            setAttemptedTabs(new Set());
            reset();
        }
    };

    return (
        <AdminLayout
            title="Add LOA / PO"
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
                        Add New
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
                        {processing ? 'Saving...' : 'Save & Continue'}
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
                </div>
            </form>
        </AdminLayout>
    );
}
