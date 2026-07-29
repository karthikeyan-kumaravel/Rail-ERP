import { useState } from 'react';

type UserType = { id: number; name: string };
type ExistingUser = {
    id: number;
    name: string;
    username: string;
    mobile_no: string;
};

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
    existingUsers: ExistingUser[];
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
    existingUsers,
    passwordRequired,
}: UserFormFieldsProps) {
    const [mobileSearch, setMobileSearch] = useState(data.mobile_no || '');
    const [showMobileDropdown, setShowMobileDropdown] = useState(false);

    const filteredMobiles = existingUsers.filter((u) =>
        u.mobile_no?.includes(mobileSearch),
    );

    return (
        <div className="grid gap-5 sm:grid-cols-2">
            {/* STAFF NAME - DROPDOWN */}
            <div>
                <label htmlFor="name" className={labelClass}>
                    Staff Name
                </label>
                <select
                    id="name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    className={inputClass}
                >
                    <option value="">Select staff name</option>
                    {existingUsers.map((user) => (
                        <option key={user.id} value={user.name}>
                            {user.name}
                        </option>
                    ))}
                </select>
                {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            {/* USER NAME - DROPDOWN */}
            <div>
                <label htmlFor="username" className={labelClass}>
                    User Name
                </label>
                <select
                    id="username"
                    value={data.username}
                    onChange={(event) =>
                        setData('username', event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">Select user name</option>
                    {existingUsers.map((user) => (
                        <option key={user.id} value={user.username}>
                            {user.username}
                        </option>
                    ))}
                </select>
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

            {/* MOBILE NO - SEARCH BOX */}
            <div className="relative">
                <label htmlFor="mobile_no" className={labelClass}>
                    Mobile No
                </label>
                <input
                    id="mobile_no"
                    type="text"
                    value={mobileSearch}
                    onChange={(event) => {
                        setMobileSearch(event.target.value);
                        setData('mobile_no', event.target.value);
                        setShowMobileDropdown(true);
                    }}
                    onFocus={() => setShowMobileDropdown(true)}
                    placeholder="Search mobile number..."
                    className={inputClass}
                    autoComplete="off"
                />
                {errors.mobile_no && (
                    <p className={errorClass}>{errors.mobile_no}</p>
                )}

                {showMobileDropdown &&
                    mobileSearch &&
                    filteredMobiles.length > 0 && (
                        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface)] shadow-lg">
                            {filteredMobiles.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => {
                                        setData('mobile_no', user.mobile_no);
                                        setMobileSearch(user.mobile_no);
                                        setShowMobileDropdown(false);
                                    }}
                                    className="cursor-pointer px-4 py-2 text-sm hover:bg-[var(--color-surface-soft)]"
                                >
                                    {user.mobile_no} — {user.name}
                                </div>
                            ))}
                        </div>
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
