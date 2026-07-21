import { useEffect } from 'react';

export type CustomerFormData = {
    name: string;
    billing_address: string;
    pin_code: string;
    state_id: number | '';
    district_id: number | '';
    zone: string;
    contact_name: string;
    contact_number: string;
    contact_landline_number: string;
    email: string;
    active_status: '1' | '0';
};

export type StateOption = { id: number; name: string };
export type DistrictOption = { id: number; name: string; state_id: number };

type CustomerFormFieldsProps = {
    data: CustomerFormData;
    setData: <K extends keyof CustomerFormData>(
        key: K,
        value: CustomerFormData[K],
    ) => void;
    errors: Partial<Record<keyof CustomerFormData, string>>;
    states: StateOption[];
    districts: DistrictOption[];
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function CustomerFormFields({
    data,
    setData,
    errors,
    states,
    districts,
}: CustomerFormFieldsProps) {
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
                <label htmlFor="name" className={labelClass}>
                    Customer
                </label>
                <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="e.g. Acme Traders"
                    className={inputClass}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
                <label htmlFor="billing_address" className={labelClass}>
                    Billing Address
                </label>
                <textarea
                    id="billing_address"
                    value={data.billing_address}
                    onChange={(event) =>
                        setData('billing_address', event.target.value)
                    }
                    rows={1}
                    placeholder="e.g. 12 Main Street, Alappuzha"
                    className={inputClass}
                />
                {errors.billing_address && (
                    <p className={errorClass}>{errors.billing_address}</p>
                )}
            </div>

            <div>
                <label htmlFor="pin_code" className={labelClass}>
                    Pin Code
                </label>
                <input
                    id="pin_code"
                    type="text"
                    value={data.pin_code}
                    onChange={(event) =>
                        setData('pin_code', event.target.value)
                    }
                    placeholder="e.g. 688001"
                    className={inputClass}
                />
                {errors.pin_code && (
                    <p className={errorClass}>{errors.pin_code}</p>
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
                <label htmlFor="zone" className={labelClass}>
                    Zone
                </label>
                <input
                    id="zone"
                    type="text"
                    value={data.zone}
                    onChange={(event) => setData('zone', event.target.value)}
                    placeholder="e.g. Alappuzha"
                    className={inputClass}
                />
                {errors.zone && <p className={errorClass}>{errors.zone}</p>}
            </div>

            <div>
                <label htmlFor="contact_name" className={labelClass}>
                    Contact Name
                </label>
                <input
                    id="contact_name"
                    type="text"
                    value={data.contact_name}
                    onChange={(event) =>
                        setData('contact_name', event.target.value)
                    }
                    placeholder="e.g. John Doe"
                    className={inputClass}
                />
                {errors.contact_name && (
                    <p className={errorClass}>{errors.contact_name}</p>
                )}
            </div>

            <div>
                <label htmlFor="contact_number" className={labelClass}>
                    Contact Number
                </label>
                <input
                    id="contact_number"
                    type="text"
                    value={data.contact_number}
                    onChange={(event) =>
                        setData('contact_number', event.target.value)
                    }
                    placeholder="e.g. 9876543210"
                    className={inputClass}
                />
                {errors.contact_number && (
                    <p className={errorClass}>{errors.contact_number}</p>
                )}
            </div>

            <div>
                <label htmlFor="contact_landline_number" className={labelClass}>
                    Contact Landline Number
                </label>
                <input
                    id="contact_landline_number"
                    type="text"
                    value={data.contact_landline_number}
                    onChange={(event) =>
                        setData('contact_landline_number', event.target.value)
                    }
                    placeholder="e.g. 0471123456"
                    className={inputClass}
                />
                {errors.contact_landline_number && (
                    <p className={errorClass}>
                        {errors.contact_landline_number}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="email" className={labelClass}>
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    placeholder="e.g. contact@example.com"
                    className={inputClass}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
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
