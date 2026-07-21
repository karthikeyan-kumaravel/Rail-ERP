import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/engineers';
import EngineerAdditionalTab from './engineer-additional-tab';
import EngineerBankingTab from './engineer-banking-tab';
import EngineerContactTab from './engineer-contact-tab';
import EngineerEmploymentTab from './engineer-employment-tab';
import {
    defaultEngineerFormData,
    validateEngineerTab,
} from './engineer-form-fields';
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

type CreateProps = {
    engineerTypes: EngineerTypeOption[];
    states: StateOption[];
    cities: CityOption[];
};

export default function EngineersCreate({
    engineerTypes,
    states,
    cities,
}: CreateProps) {
    const { data, setData, post, transform, processing, errors, reset } =
        useForm<EngineerFormData>(defaultEngineerFormData());

    const [activeTab, setActiveTab] = useState<EngineerTabKey>(
        ENGINEER_TAB_ORDER[0],
    );
    const [attemptedTabs, setAttemptedTabs] = useState<Set<EngineerTabKey>>(
        new Set(),
    );

    // Nothing has been persisted yet on the create page, so only the very
    // first tab is reachable — the rest unlock once the record exists (on
    // the edit page) and each preceding tab has been saved.
    const isLocked = (tab: EngineerTabKey) =>
        ENGINEER_TAB_ORDER.indexOf(tab) > 0;

    const hasError = (tab: EngineerTabKey) =>
        attemptedTabs.has(tab) &&
        Object.keys(validateEngineerTab(tab, data)).length > 0;

    const stepErrors = attemptedTabs.has(activeTab)
        ? validateEngineerTab(activeTab, data)
        : {};
    const displayErrors = { ...errors, ...stepErrors };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        setAttemptedTabs((tabs) => new Set(tabs).add(activeTab));

        if (Object.keys(validateEngineerTab(activeTab, data)).length > 0) {
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
            title="Add Engineer"
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
