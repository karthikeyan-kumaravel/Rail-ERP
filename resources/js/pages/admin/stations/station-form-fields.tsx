import { useEffect } from 'react';

export type StationFormData = {
    zone_id: number | '';
    division_id: number | '';
    state_id: number | '';
    district_id: number | '';
    city_id: number | '';
    station_code: string;
    station_name: string;
    address: string;
    latitude: string;
    longitude: string;
    active_status: '1' | '0';
};

export type ZoneOption = { id: number; name: string };
export type DivisionOption = { id: number; name: string; zone_id: number };
export type StateOption = { id: number; name: string };
export type DistrictOption = { id: number; name: string; state_id: number };
export type CityOption = { id: number; name: string; district_id: number };

type StationFormFieldsProps = {
    data: StationFormData;
    setData: <K extends keyof StationFormData>(
        key: K,
        value: StationFormData[K],
    ) => void;
    errors: Partial<Record<keyof StationFormData, string>>;
    zones: ZoneOption[];
    divisions: DivisionOption[];
    states: StateOption[];
    districts: DistrictOption[];
    cities: CityOption[];
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function StationFormFields({
    data,
    setData,
    errors,
    zones,
    divisions,
    states,
    districts,
    cities,
}: StationFormFieldsProps) {
    const filteredDivisions = divisions.filter(
        (division) => division.zone_id === data.zone_id,
    );
    const filteredDistricts = districts.filter(
        (district) => district.state_id === data.state_id,
    );
    const filteredCities = cities.filter(
        (city) => city.district_id === data.district_id,
    );

    useEffect(() => {
        if (
            data.division_id !== '' &&
            !filteredDivisions.some(
                (division) => division.id === data.division_id,
            )
        ) {
            setData('division_id', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.zone_id]);

    useEffect(() => {
        if (
            data.district_id !== '' &&
            !filteredDistricts.some(
                (district) => district.id === data.district_id,
            )
        ) {
            setData('district_id', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.state_id]);

    useEffect(() => {
        if (
            data.city_id !== '' &&
            !filteredCities.some((city) => city.id === data.city_id)
        ) {
            setData('city_id', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.district_id]);

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
                <label htmlFor="zone_id" className={labelClass}>
                    Zone
                </label>
                <select
                    id="zone_id"
                    value={data.zone_id}
                    onChange={(event) =>
                        setData(
                            'zone_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={inputClass}
                >
                    <option value="">Select a zone</option>
                    {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                            {zone.name}
                        </option>
                    ))}
                </select>
                {errors.zone_id && (
                    <p className={errorClass}>{errors.zone_id}</p>
                )}
            </div>

            <div>
                <label htmlFor="division_id" className={labelClass}>
                    Division
                </label>
                <select
                    id="division_id"
                    value={data.division_id}
                    onChange={(event) =>
                        setData(
                            'division_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    disabled={data.zone_id === ''}
                    className={inputClass}
                >
                    <option value="">Select a division</option>
                    {filteredDivisions.map((division) => (
                        <option key={division.id} value={division.id}>
                            {division.name}
                        </option>
                    ))}
                </select>
                {errors.division_id && (
                    <p className={errorClass}>{errors.division_id}</p>
                )}
            </div>

            <div>
                <label htmlFor="station_code" className={labelClass}>
                    Station Code
                </label>
                <input
                    id="station_code"
                    type="text"
                    value={data.station_code}
                    onChange={(event) =>
                        setData('station_code', event.target.value)
                    }
                    placeholder="e.g. MAS"
                    className={inputClass}
                />
                {errors.station_code && (
                    <p className={errorClass}>{errors.station_code}</p>
                )}
            </div>

            <div>
                <label htmlFor="station_name" className={labelClass}>
                    Station Name
                </label>
                <input
                    id="station_name"
                    type="text"
                    value={data.station_name}
                    onChange={(event) =>
                        setData('station_name', event.target.value)
                    }
                    placeholder="e.g. Chennai Central"
                    className={inputClass}
                />
                {errors.station_name && (
                    <p className={errorClass}>{errors.station_name}</p>
                )}
            </div>

            <div>
                <label htmlFor="state_id" className={labelClass}>
                    State
                </label>
                <select
                    id="state_id"
                    value={data.state_id}
                    onChange={(event) =>
                        setData(
                            'state_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={inputClass}
                >
                    <option value="">Select a state</option>
                    {states.map((state) => (
                        <option key={state.id} value={state.id}>
                            {state.name}
                        </option>
                    ))}
                </select>
                {errors.state_id && (
                    <p className={errorClass}>{errors.state_id}</p>
                )}
            </div>

            <div>
                <label htmlFor="district_id" className={labelClass}>
                    District
                </label>
                <select
                    id="district_id"
                    value={data.district_id}
                    onChange={(event) =>
                        setData(
                            'district_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    disabled={data.state_id === ''}
                    className={inputClass}
                >
                    <option value="">Select a district</option>
                    {filteredDistricts.map((district) => (
                        <option key={district.id} value={district.id}>
                            {district.name}
                        </option>
                    ))}
                </select>
                {errors.district_id && (
                    <p className={errorClass}>{errors.district_id}</p>
                )}
            </div>

            <div>
                <label htmlFor="city_id" className={labelClass}>
                    City
                </label>
                <select
                    id="city_id"
                    value={data.city_id}
                    onChange={(event) =>
                        setData(
                            'city_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    disabled={data.district_id === ''}
                    className={inputClass}
                >
                    <option value="">Select a city</option>
                    {filteredCities.map((city) => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>
                {errors.city_id && (
                    <p className={errorClass}>{errors.city_id}</p>
                )}
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
                <label htmlFor="address" className={labelClass}>
                    Address
                </label>
                <textarea
                    id="address"
                    value={data.address}
                    onChange={(event) => setData('address', event.target.value)}
                    rows={1}
                    placeholder="e.g. Station Road, Chennai"
                    className={inputClass}
                />
                {errors.address && (
                    <p className={errorClass}>{errors.address}</p>
                )}
            </div>

            <div>
                <label htmlFor="latitude" className={labelClass}>
                    Latitude
                </label>
                <input
                    id="latitude"
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    value={data.latitude}
                    onChange={(event) =>
                        setData('latitude', event.target.value)
                    }
                    placeholder="e.g. 13.0827"
                    className={inputClass}
                />
                {errors.latitude && (
                    <p className={errorClass}>{errors.latitude}</p>
                )}
            </div>

            <div>
                <label htmlFor="longitude" className={labelClass}>
                    Longitude
                </label>
                <input
                    id="longitude"
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    value={data.longitude}
                    onChange={(event) =>
                        setData('longitude', event.target.value)
                    }
                    placeholder="e.g. 80.2707"
                    className={inputClass}
                />
                {errors.longitude && (
                    <p className={errorClass}>{errors.longitude}</p>
                )}
            </div>

            <div>
                <label htmlFor="active_status" className={labelClass}>
                    Active Status
                </label>
                <select
                    id="active_status"
                    value={data.active_status}
                    onChange={(event) =>
                        setData(
                            'active_status',
                            event.target.value === '1' ? '1' : '0',
                        )
                    }
                    className={inputClass}
                >
                    <option value="1">Active</option>
                    <option value="0">In active</option>
                </select>
                {errors.active_status && (
                    <p className={errorClass}>{errors.active_status}</p>
                )}
            </div>
        </div>
    );
}
