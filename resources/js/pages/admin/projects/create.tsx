import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/projects';
import ProjectFormFields from './project-form-fields';
import type { OptionItem, ProjectFormData } from './project-form-fields';

type CreateProps = {
    customers: OptionItem[];
    zones: OptionItem[];
    divisions: OptionItem[];
    loas: OptionItem[];
};

export default function ProjectsCreate({
    customers,
    zones,
    divisions,
    loas,
}: CreateProps) {
    const { data, setData, post, processing, errors } =
        useForm<ProjectFormData>({
            name: '',
            customer_id: '',
            zone_id: '',
            division_id: '',
            loa_id: '',
            contract_value: '',
            active_status: '1',
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(store.url());
    };

    return (
        <AdminLayout
            title="Add Project"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / Sub Setting / Project Creation
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
                <ProjectFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                    customers={customers}
                    zones={zones}
                    divisions={divisions}
                    loas={loas}
                />

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save'}
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
