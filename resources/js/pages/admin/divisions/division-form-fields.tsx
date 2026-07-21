export type DivisionFormData = {
    zone_id: number | '';
    name: string;
    code: string;
    active_status: '1' | '0';
};

export type ZoneOption = { id: number; name: string };

type DivisionFormFieldsProps = {
    data: DivisionFormData;
    setData: <K extends keyof DivisionFormData>(
        key: K,
        value: DivisionFormData[K],
    ) => void;
    errors: Partial<Record<keyof DivisionFormData, string>>;
    zones: ZoneOption[];
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function DivisionFormFields({
    data,
    setData,
    errors,
    zones,
}: DivisionFormFieldsProps) {
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
                <label htmlFor="name" className={labelClass}>
                    Division Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="e.g. Chennai Division"
                    className={inputClass}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="code" className={labelClass}>
                    Code
                </label>
                <input
                    id="code"
                    type="text"
                    value={data.code}
                    onChange={(event) => setData('code', event.target.value)}
                    placeholder="e.g. MAS"
                    className={inputClass}
                />
                {errors.code && <p className={errorClass}>{errors.code}</p>}
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
