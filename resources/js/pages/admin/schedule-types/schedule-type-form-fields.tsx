export type ScheduleTypeFormData = {
    schedule_name_id: number | '';
    name: string;
    short_name: string;
    active_status: '1' | '0';
};

export type ScheduleNameOption = { id: number; name: string };

type ScheduleTypeFormFieldsProps = {
    data: ScheduleTypeFormData;
    setData: <K extends keyof ScheduleTypeFormData>(
        key: K,
        value: ScheduleTypeFormData[K],
    ) => void;
    errors: Partial<Record<keyof ScheduleTypeFormData, string>>;
    scheduleNames: ScheduleNameOption[];
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function ScheduleTypeFormFields({
    data,
    setData,
    errors,
    scheduleNames,
}: ScheduleTypeFormFieldsProps) {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
                <label htmlFor="schedule_name_id" className={labelClass}>
                    Schedule Name
                </label>
                <select
                    id="schedule_name_id"
                    value={data.schedule_name_id}
                    onChange={(event) =>
                        setData(
                            'schedule_name_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={inputClass}
                >
                    <option value="">Select a schedule name</option>
                    {scheduleNames.map((scheduleName) => (
                        <option key={scheduleName.id} value={scheduleName.id}>
                            {scheduleName.name}
                        </option>
                    ))}
                </select>
                {errors.schedule_name_id && (
                    <p className={errorClass}>{errors.schedule_name_id}</p>
                )}
            </div>

            <div>
                <label htmlFor="name" className={labelClass}>
                    Schedule Type Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="e.g. Weekly Progress"
                    className={inputClass}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="short_name" className={labelClass}>
                    Schedule Type Short Name
                </label>
                <input
                    id="short_name"
                    type="text"
                    value={data.short_name}
                    onChange={(event) =>
                        setData('short_name', event.target.value)
                    }
                    placeholder="e.g. WKLY"
                    className={inputClass}
                />
                {errors.short_name && (
                    <p className={errorClass}>{errors.short_name}</p>
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
