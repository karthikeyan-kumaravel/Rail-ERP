import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/cities';
import CityFormFields from './city-form-fields';
import type {
    CityFormData,
    DistrictOption,
    StateOption,
} from './city-form-fields';

type EditCity = {
    unique_id: string;
    state_id: number;
    district_id: number;
    name: string;
    city_code: string | null;
    pincode: string;
    active_status: boolean;
};

type EditProps = {
    city: EditCity;
    states: StateOption[];
    districts: DistrictOption[];
};

export default function CitiesEdit({ city, states, districts }: EditProps) {
    const { data, setData, put, processing, errors } =
        useForm<CityFormData>({
            state_id: city.state_id,
            district_id: city.district_id,
            name: city.name,
            city_code: city.city_code ?? '',
            pincode: city.pincode,
            active_status: city.active_status ? '1' : '0',
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(update.url(city.unique_id));
    };

    return (
        <AdminLayout
            title="Edit City"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / Settings / City
                    </Link>
                    <span className="mx-1.5 text-[var(--color-ink)]/40">/</span>
                    <span className="font-semibold text-[var(--color-ink)]">Edit</span>
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

                <CityFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                    states={states}
                    districts={districts}
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
