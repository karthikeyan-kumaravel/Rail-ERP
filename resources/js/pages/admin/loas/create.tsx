import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/loas';
import LoaDetailsTab from './loa-details-tab';
import LoaFinancialSecurityTab from './loa-financial-security-tab';
import { defaultLoaFormData, validateLoaTab } from './loa-form-fields';
import type {
    BankOption,
    DivisionOption,
    EngineerTypeOption,
    LoaFormData,
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

// Only 'details' is ever active on the create page (every later tab is
// locked until the record exists on the edit page) — this is the field
// surface whose stale server errors get cleared once the user edits them.
const DETAILS_TAB_FIELD_PREFIXES = [
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
];

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

    const hasError = (tab: LoaTabKey) =>
        attemptedTabs.has(tab) &&
        Object.keys(validateLoaTab(tab, data)).length > 0;

    const stepErrors = attemptedTabs.has(activeTab)
        ? validateLoaTab(activeTab, data)
        : {};
    // Server errors persist in Inertia's `errors` until the next successful
    // round trip — once the user edits a field on the active tab, a fresh
    // client check should supersede any now-stale server message for that
    // same field, not just sit alongside it. Only 'details' is ever active
    // on this page, so its own field list is all that needs stripping.
    const liveServerErrors =
        activeTab === 'details'
            ? Object.fromEntries(
                  Object.entries(errors).filter(
                      ([key]) =>
                          !DETAILS_TAB_FIELD_PREFIXES.some(
                              (prefix) =>
                                  key === prefix ||
                                  key.startsWith(`${prefix}.`),
                          ),
                  ),
              )
            : errors;
    const displayErrors = { ...liveServerErrors, ...stepErrors };

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

        if (Object.keys(validateLoaTab(activeTab, data)).length > 0) {
            return;
        }

        transform((formData) => ({
            ...formData,
            current_step: activeTab,
            finish: false,
        }));
        post(store.url(), { preserveScroll: true });
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
