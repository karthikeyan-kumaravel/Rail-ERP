import NumericInput from '@/lib/numeric-input';

export type ProjectFormData = {
    name: string;
    customer_id: number | '';
    zone_id: number | '';
    division_id: number | '';
    loa_id: number | '';
    contract_value: string;
    active_status: '1' | '0';
};

export type OptionItem = { id: number; name: string };

type ProjectFormFieldsProps = {
    data: ProjectFormData;
    setData: <K extends keyof ProjectFormData>(
        key: K,
        value: ProjectFormData[K],
    ) => void;
    errors: Partial<Record<keyof ProjectFormData, string>>;
    customers: OptionItem[];
    zones: OptionItem[];
    divisions: OptionItem[];
    loas: OptionItem[];
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function ProjectFormFields({
    data,
    setData,
    errors,
    customers,
    zones,
    divisions,
    loas,
}: ProjectFormFieldsProps) {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
                <label htmlFor="name" className={labelClass}>
                    Project Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="e.g. Chennai CCTV Upgrade"
                    className={inputClass}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="customer_id" className={labelClass}>
                    Client
                </label>
                <select
                    id="customer_id"
                    value={data.customer_id}
                    onChange={(event) =>
                        setData(
                            'customer_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={inputClass}
                >
                    <option value="">Select a client</option>
                    {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                            {customer.name}
                        </option>
                    ))}
                </select>
                {errors.customer_id && (
                    <p className={errorClass}>{errors.customer_id}</p>
                )}
            </div>

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
                    className={inputClass}
                >
                    <option value="">Select a division</option>
                    {divisions.map((division) => (
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
                <label htmlFor="loa_id" className={labelClass}>
                    LOA Number
                </label>
                <select
                    id="loa_id"
                    value={data.loa_id}
                    onChange={(event) =>
                        setData(
                            'loa_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={inputClass}
                >
                    <option value="">Select an LOA</option>
                    {loas.map((loa) => (
                        <option key={loa.id} value={loa.id}>
                            {loa.name}
                        </option>
                    ))}
                </select>
                {errors.loa_id && <p className={errorClass}>{errors.loa_id}</p>}
            </div>

            <div>
                <label htmlFor="contract_value" className={labelClass}>
                    Contract Value
                </label>
                <NumericInput
                    id="contract_value"
                    allowDecimal
                    step="0.01"
                    min="0"
                    value={data.contract_value}
                    onChange={(event) =>
                        setData('contract_value', event.target.value)
                    }
                    placeholder="e.g. 2500000"
                    className={inputClass}
                />
                {errors.contract_value && (
                    <p className={errorClass}>{errors.contract_value}</p>
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
