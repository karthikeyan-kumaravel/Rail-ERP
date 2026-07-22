import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/departments';
import DepartmentFormFields from './department-form-fields';
import type { DepartmentFormData } from './department-form-fields';

type EditDepartment = {
    unique_id: string;
    name: string;
    active_status: boolean;
};

type EditProps = {
    department: EditDepartment;
};

export default function DepartmentsEdit({ department }: EditProps) {
    const { data, setData, put, processing, errors } =
        useForm<DepartmentFormData>({
            name: department.name,
            active_status: department.active_status ? '1' : '0',
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(update.url(department.unique_id));
    };

    return (
        <AdminLayout
            title="Edit Department"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / Sub Setting / Department
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
                <DepartmentFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                />

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save changes'}
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
