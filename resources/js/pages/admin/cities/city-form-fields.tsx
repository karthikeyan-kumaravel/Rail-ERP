import { useEffect } from 'react';

export type CityFormData = {
    state_id: number | '';
    district_id: number | '';
    name: string;
    city_code: string;
    pincode: string;
    active_status: '1' | '0';
};

export type StateOption = { id: number; name: string };
export type DistrictOption = { id: number; name: string; state_id: number };

type CityFormFieldsProps = {
    data: CityFormData;
    setData: <K extends keyof CityFormData>(
        key: K,
        value: CityFormData[K],
    ) => void;
    errors: Partial<Record<keyof CityFormData, string>>;
    states: StateOption[];
    districts: DistrictOption[];
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function CityFormFields({
    data,
    setData,
    errors,
    states,
    districts,
}: CityFormFieldsProps) {
    const filteredDistricts = districts.filter(
        (district) => district.state_id === data.state_id,
    );

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

    return (
        <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                    <label htmlFor="name" className={labelClass}>
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        placeholder="e.g. Coimbatore"
                        className={inputClass}
                    />
                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="city_code" className={labelClass}>
                        City Code
                    </label>
                    <input
                        id="city_code"
                        type="text"
                        value={data.city_code}
                        onChange={(event) =>
                            setData('city_code', event.target.value)
                        }
                        placeholder="e.g. CBE"
                        className={inputClass}
                    />
                    {errors.city_code && (
                        <p className={errorClass}>{errors.city_code}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="pincode" className={labelClass}>
                        Pincode
                    </label>
                    <input
                        id="pincode"
                        type="text"
                        value={data.pincode}
                        onChange={(event) =>
                            setData('pincode', event.target.value)
                        }
                        placeholder="e.g. 641001"
                        className={inputClass}
                    />
                    {errors.pincode && (
                        <p className={errorClass}>{errors.pincode}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="active_status" className={labelClass}>
                        Status
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
        </div>
    );
}
