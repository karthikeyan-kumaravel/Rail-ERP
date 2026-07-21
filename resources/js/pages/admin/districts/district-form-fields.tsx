export type DistrictFormData = {
    state_id: number | '';
    name: string;
    code: string;
    active_status: '1' | '0';
};

export type StateOption = { id: number; name: string };

type DistrictFormFieldsProps = {
    data: DistrictFormData;
    setData: <K extends keyof DistrictFormData>(
        key: K,
        value: DistrictFormData[K],
    ) => void;
    errors: Partial<Record<keyof DistrictFormData, string>>;
    states: StateOption[];
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function DistrictFormFields({
    data,
    setData,
    errors,
    states,
}: DistrictFormFieldsProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                        placeholder="e.g. Chennai"
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
                        onChange={(event) =>
                            setData('code', event.target.value)
                        }
                        placeholder="e.g. CHN"
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
        </div>
    );
}
