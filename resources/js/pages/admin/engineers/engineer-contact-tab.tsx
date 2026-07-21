import { useEffect, useState } from 'react';
import { errorClass, inputClass, labelClass } from './engineer-form-fields';
import type {
    CityOption,
    EngineerFormData,
    EngineerFormErrors,
    EngineerSetData,
    StateOption,
} from './engineer-form-fields';

type EngineerContactTabProps = {
    data: EngineerFormData;
    setData: EngineerSetData;
    errors: EngineerFormErrors;
    states: StateOption[];
    cities: CityOption[];
    className?: string;
};

export default function EngineerContactTab({
    data,
    setData,
    errors,
    states,
    cities,
    className,
}: EngineerContactTabProps) {
    const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

    const filteredCities = cities.filter(
        (city) => city.state_id === data.state_id,
    );

    useEffect(() => {
        if (
            data.city_id !== '' &&
            !filteredCities.some((city) => city.id === data.city_id)
        ) {
            setData('city_id', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.state_id]);

    useEffect(() => {
        if (sameAsCurrentAddress) {
            setData('permanent_address', data.current_address);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sameAsCurrentAddress, data.current_address]);

    return (
        <div
            className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${className ?? ''}`}
        >
            <div>
                <label htmlFor="mobile_number" className={labelClass}>
                    Mobile Number *
                </label>
                <input
                    id="mobile_number"
                    type="text"
                    value={data.mobile_number}
                    onChange={(event) =>
                        setData('mobile_number', event.target.value)
                    }
                    placeholder="e.g. 9876543210"
                    className={inputClass}
                />
                {errors.mobile_number && (
                    <p className={errorClass}>{errors.mobile_number}</p>
                )}
            </div>

            <div>
                <label htmlFor="alternate_mobile_number" className={labelClass}>
                    Alternate Mobile Number
                </label>
                <input
                    id="alternate_mobile_number"
                    type="text"
                    value={data.alternate_mobile_number}
                    onChange={(event) =>
                        setData('alternate_mobile_number', event.target.value)
                    }
                    placeholder="e.g. 9876500000"
                    className={inputClass}
                />
                {errors.alternate_mobile_number && (
                    <p className={errorClass}>
                        {errors.alternate_mobile_number}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="official_email" className={labelClass}>
                    Official Email *
                </label>
                <input
                    id="official_email"
                    type="email"
                    value={data.official_email}
                    onChange={(event) =>
                        setData('official_email', event.target.value)
                    }
                    placeholder="e.g. rajesh.kumar@railerp.in"
                    className={inputClass}
                />
                {errors.official_email && (
                    <p className={errorClass}>{errors.official_email}</p>
                )}
            </div>

            <div>
                <label htmlFor="personal_email" className={labelClass}>
                    Personal Email
                </label>
                <input
                    id="personal_email"
                    type="email"
                    value={data.personal_email}
                    onChange={(event) =>
                        setData('personal_email', event.target.value)
                    }
                    placeholder="e.g. rajesh@example.com"
                    className={inputClass}
                />
                {errors.personal_email && (
                    <p className={errorClass}>{errors.personal_email}</p>
                )}
            </div>

            <div className="md:col-span-2">
                <label htmlFor="current_address" className={labelClass}>
                    Current Address
                </label>
                <textarea
                    id="current_address"
                    value={data.current_address}
                    onChange={(event) =>
                        setData('current_address', event.target.value)
                    }
                    rows={2}
                    placeholder="e.g. 12 Main Street, Chennai"
                    className={inputClass}
                />
                {errors.current_address && (
                    <p className={errorClass}>{errors.current_address}</p>
                )}
            </div>

            <div className="md:col-span-2">
                <div className="mb-1.5 flex items-center justify-between">
                    <label
                        htmlFor="permanent_address"
                        className={`${labelClass} mb-0`}
                    >
                        Permanent Address
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[var(--color-ink)]/70">
                        <input
                            type="checkbox"
                            checked={sameAsCurrentAddress}
                            onChange={(event) =>
                                setSameAsCurrentAddress(event.target.checked)
                            }
                            className="h-4 w-4 rounded border-[var(--color-gold)]/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)]/40"
                        />
                        Same as Current Address
                    </label>
                </div>
                <textarea
                    id="permanent_address"
                    value={data.permanent_address}
                    onChange={(event) =>
                        setData('permanent_address', event.target.value)
                    }
                    disabled={sameAsCurrentAddress}
                    rows={2}
                    placeholder="e.g. 12 Main Street, Chennai"
                    className={inputClass}
                />
                {errors.permanent_address && (
                    <p className={errorClass}>{errors.permanent_address}</p>
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
                    disabled={data.state_id === ''}
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

            <div>
                <label htmlFor="postal_code" className={labelClass}>
                    Postal Code
                </label>
                <input
                    id="postal_code"
                    type="text"
                    value={data.postal_code}
                    onChange={(event) =>
                        setData('postal_code', event.target.value)
                    }
                    placeholder="e.g. 600001"
                    className={inputClass}
                />
                {errors.postal_code && (
                    <p className={errorClass}>{errors.postal_code}</p>
                )}
            </div>
        </div>
    );
}
