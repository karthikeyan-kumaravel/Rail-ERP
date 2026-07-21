type UserType = { id: number; name: string };

export type UserFormData = {
    name: string;
    username: string;
    email: string;
    mobile_no: string;
    user_type_id: number | '';
    password: string;
    password_confirmation: string;
};

type UserFormFieldsProps = {
    data: UserFormData;
    setData: <K extends keyof UserFormData>(
        key: K,
        value: UserFormData[K],
    ) => void;
    errors: Partial<Record<keyof UserFormData, string>>;
    userTypes: UserType[];
    passwordRequired: boolean;
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function UserFormFields({
    data,
    setData,
    errors,
    userTypes,
    passwordRequired,
}: UserFormFieldsProps) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label htmlFor="name" className={labelClass}>
                    Staff Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="e.g. Balamugundan N"
                    className={inputClass}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="username" className={labelClass}>
                    User Name
                </label>
                <input
                    id="username"
                    type="text"
                    value={data.username}
                    onChange={(event) =>
                        setData('username', event.target.value)
                    }
                    placeholder="e.g. AED635"
                    className={inputClass}
                />
                {errors.username && (
                    <p className={errorClass}>{errors.username}</p>
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
                    placeholder="name@example.com"
                    className={inputClass}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>

            <div>
                <label htmlFor="mobile_no" className={labelClass}>
                    Mobile No
                </label>
                <input
                    id="mobile_no"
                    type="text"
                    value={data.mobile_no}
                    onChange={(event) =>
                        setData('mobile_no', event.target.value)
                    }
                    placeholder="e.g. 9790099027"
                    className={inputClass}
                />
                {errors.mobile_no && (
                    <p className={errorClass}>{errors.mobile_no}</p>
                )}
            </div>

            <div>
                <label htmlFor="user_type_id" className={labelClass}>
                    User Type
                </label>
                <select
                    id="user_type_id"
                    value={data.user_type_id}
                    onChange={(event) =>
                        setData(
                            'user_type_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={inputClass}
                >
                    <option value="">Select a user type</option>
                    {userTypes.map((userType) => (
                        <option key={userType.id} value={userType.id}>
                            {userType.name}
                        </option>
                    ))}
                </select>
                {errors.user_type_id && (
                    <p className={errorClass}>{errors.user_type_id}</p>
                )}
            </div>

            <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-5">
                <div>
                    <label htmlFor="password" className={labelClass}>
                        {passwordRequired
                            ? 'Password'
                            : 'New Password (optional)'}
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                        placeholder={
                            passwordRequired
                                ? 'Enter a password'
                                : 'Leave blank to keep current password'
                        }
                        className={inputClass}
                    />
                    {errors.password && (
                        <p className={errorClass}>{errors.password}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="password_confirmation"
                        className={labelClass}
                    >
                        Confirm Password
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(event) =>
                            setData('password_confirmation', event.target.value)
                        }
                        placeholder="Re-enter password"
                        className={inputClass}
                    />
                </div>
            </div>
        </div>
    );
}
