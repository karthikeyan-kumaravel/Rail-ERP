import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/schedule-types';
import ScheduleTypeFormFields from './schedule-type-form-fields';
import type {
    ScheduleNameOption,
    ScheduleTypeFormData,
} from './schedule-type-form-fields';

type EditScheduleType = {
    unique_id: string;
    schedule_name_id: number;
    name: string;
    short_name: string;
    active_status: boolean;
};

type EditProps = {
    scheduleType: EditScheduleType;
    scheduleNames: ScheduleNameOption[];
};

export default function ScheduleTypesEdit({
    scheduleType,
    scheduleNames,
}: EditProps) {
    const { data, setData, put, processing, errors } =
        useForm<ScheduleTypeFormData>({
            schedule_name_id: scheduleType.schedule_name_id,
            name: scheduleType.name,
            short_name: scheduleType.short_name,
            active_status: scheduleType.active_status ? '1' : '0',
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(update.url(scheduleType.unique_id));
    };

    return (
        <AdminLayout
            title="Edit Schedule Type"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / Sub Setting / Schedule Type
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
                <ScheduleTypeFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                    scheduleNames={scheduleNames}
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
