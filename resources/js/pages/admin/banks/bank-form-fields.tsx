export type BankFormData = {
    name: string;
    branch_name: string;
    ifsc_code: string;
    account_number: string;
    account_holder_name: string;
    account_type: 'Savings' | 'Current';
    bank_address: string;
    pincode: string;
    contact_number: string;
    email: string;
    active_status: '1' | '0';
};

type BankFormFieldsProps = {
    data: BankFormData;
    setData: <K extends keyof BankFormData>(
        key: K,
        value: BankFormData[K],
    ) => void;
    errors: Partial<Record<keyof BankFormData, string>>;
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function BankFormFields({
    data,
    setData,
    errors,
}: BankFormFieldsProps) {
    return (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Bank Name */}
            <div>
                <label className={labelClass}>Name</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => {
                        console.log(e.target.value);
                        setData('name', e.target.value);
                    }}
                    className={inputClass}
                    maxLength={100}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            {/* Branch Name */}
            <div>
                <label className={labelClass}>Branch Name</label>
                <input
                    type="text"
                    value={data.branch_name}
                    onChange={(e) => setData('branch_name', e.target.value)}
                    className={inputClass}
                    maxLength={100}
                />
                {errors.branch_name && (
                    <p className={errorClass}>{errors.branch_name}</p>
                )}
            </div>

            {/* IFSC Code */}
            <div>
                <label className={labelClass}>IFSC Code</label>
                <input
                    type="text"
                    value={data.ifsc_code}
                    onChange={(e) =>
                        setData('ifsc_code', e.target.value.toUpperCase())
                    }
                    className={inputClass}
                    maxLength={11}
                />
                {errors.ifsc_code && (
                    <p className={errorClass}>{errors.ifsc_code}</p>
                )}
            </div>

            {/* Account Number */}
            <div>
                <label className={labelClass}>Account Number</label>
                <input
                    type="text"
                    value={data.account_number}
                    onChange={(e) =>
                        setData(
                            'account_number',
                            e.target.value.replace(/\D/g, ''),
                        )
                    }
                    className={inputClass}
                    maxLength={18}
                />
                {errors.account_number && (
                    <p className={errorClass}>{errors.account_number}</p>
                )}
            </div>

            {/* Account Holder Name */}
            <div>
                <label className={labelClass}>Account Holder Name</label>
                <input
                    type="text"
                    value={data.account_holder_name}
                    onChange={(e) =>
                        setData('account_holder_name', e.target.value)
                    }
                    className={inputClass}
                    maxLength={100}
                />
                {errors.account_holder_name && (
                    <p className={errorClass}>{errors.account_holder_name}</p>
                )}
            </div>

            {/* Account Type */}
            <div>
                <label className={labelClass}>Account Type</label>
                <select
                    value={data.account_type}
                    onChange={(e) =>
                        setData(
                            'account_type',
                            e.target.value as 'Savings' | 'Current',
                        )
                    }
                    className={inputClass}
                >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                </select>
                {errors.account_type && (
                    <p className={errorClass}>{errors.account_type}</p>
                )}
            </div>

            {/* Bank Address */}
            <div className="sm:col-span-2 lg:col-span-3">
                <label className={labelClass}>Bank Address</label>
                <textarea
                    rows={3}
                    value={data.bank_address}
                    onChange={(e) => setData('bank_address', e.target.value)}
                    className={inputClass}
                    maxLength={255}
                />
                {errors.bank_address && (
                    <p className={errorClass}>{errors.bank_address}</p>
                )}
            </div>

            {/* Pincode */}
            <div>
                <label className={labelClass}>Pincode</label>
                <input
                    type="text"
                    value={data.pincode}
                    onChange={(e) =>
                        setData('pincode', e.target.value.replace(/\D/g, ''))
                    }
                    className={inputClass}
                    maxLength={6}
                />
                {errors.pincode && (
                    <p className={errorClass}>{errors.pincode}</p>
                )}
            </div>

            {/* Contact Number */}
            <div>
                <label className={labelClass}>Contact Number</label>
                <input
                    type="text"
                    value={data.contact_number}
                    onChange={(e) =>
                        setData(
                            'contact_number',
                            e.target.value.replace(/\D/g, ''),
                        )
                    }
                    className={inputClass}
                    maxLength={10}
                />
                {errors.contact_number && (
                    <p className={errorClass}>{errors.contact_number}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label className={labelClass}>Email</label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={inputClass}
                    maxLength={100}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>

            {/* Status */}
            <div>
                <label className={labelClass}>Status</label>
                <select
                    value={data.active_status}
                    onChange={(e) =>
                        setData(
                            'active_status',
                            e.target.value === '1' ? '1' : '0',
                        )
                    }
                    className={inputClass}
                >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>
                {errors.active_status && (
                    <p className={errorClass}>{errors.active_status}</p>
                )}
            </div>
        </div>
    );
}
