import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/stations';
import StationFormFields from './station-form-fields';
import type {
    CityOption,
    DistrictOption,
    DivisionOption,
    StationFormData,
    StateOption,
    ZoneOption,
} from './station-form-fields';

type EditStation = {
    unique_id: string;
    zone_id: number;
    division_id: number;
    station_code: string;
    station_name: string;
    state_id: number;
    district_id: number;
    city_id: number;
    address: string;
    latitude: string | null;
    longitude: string | null;
    active_status: boolean;
};

type EditProps = {
    station: EditStation;
    zones: ZoneOption[];
    divisions: DivisionOption[];
    states: StateOption[];
    districts: DistrictOption[];
    cities: CityOption[];
};

export default function StationsEdit({
    station,
    zones,
    divisions,
    states,
    districts,
    cities,
}: EditProps) {
    const { data, setData, put, processing, errors } = useForm<StationFormData>(
        {
            zone_id: station.zone_id,
            division_id: station.division_id,
            state_id: station.state_id,
            district_id: station.district_id,
            city_id: station.city_id,
            station_code: station.station_code,
            station_name: station.station_name,
            address: station.address,
            latitude: station.latitude ?? '',
            longitude: station.longitude ?? '',
            active_status: station.active_status ? '1' : '0',
        },
    );

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(update.url(station.unique_id));
    };

    return (
        <AdminLayout
            title="Edit Station"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / Settings / Station
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

                <StationFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                    zones={zones}
                    divisions={divisions}
                    states={states}
                    districts={districts}
                    cities={cities}
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
