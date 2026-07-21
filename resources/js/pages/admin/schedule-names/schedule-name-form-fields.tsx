export type ScheduleNameFormData = {
    name: string;
    active_status: '1' | '0';
};

type ScheduleNameFormFieldsProps = {
    data: ScheduleNameFormData;
    setData: <K extends keyof ScheduleNameFormData>(
        key: K,
        value: ScheduleNameFormData[K],
    ) => void;
    errors: Partial<Record<keyof ScheduleNameFormData, string>>;
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function ScheduleNameFormFields({
    data,
    setData,
    errors,
}: ScheduleNameFormFieldsProps) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label htmlFor="name" className={labelClass}>
                    Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="e.g. Mobilization Schedule"
                    className={inputClass}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
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
