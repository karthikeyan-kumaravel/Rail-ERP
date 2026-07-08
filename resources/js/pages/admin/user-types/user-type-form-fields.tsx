export type UserTypeFormData = {
    name: string;
    active_status: '1' | '0';
};

type UserTypeFormFieldsProps = {
    data: UserTypeFormData;
    setData: <K extends keyof UserTypeFormData>(
        key: K,
        value: UserTypeFormData[K],
    ) => void;
    errors: Partial<Record<keyof UserTypeFormData, string>>;
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[#e0a94a] uppercase';
const inputClass =
    'w-full rounded-lg border border-[#e0a94a]/25 bg-[#0f2436] px-4 py-2.5 text-sm text-[#fdede1] placeholder-[#fdede1]/35 outline-none transition focus:border-[#f2905c] focus:ring-2 focus:ring-[#f2905c]/40';
const errorClass = 'mt-1.5 text-xs text-[#f2905c]';

export default function UserTypeFormFields({
    data,
    setData,
    errors,
}: UserTypeFormFieldsProps) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label htmlFor="name" className={labelClass}>
                    User Type Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="e.g. Administrator"
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
