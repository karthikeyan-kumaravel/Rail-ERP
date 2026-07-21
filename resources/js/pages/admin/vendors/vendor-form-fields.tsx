import { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@/lib/icons';

export type VendorFormData = {
    company_name: string;
    name: string;
    contact_no: string;
    alternate_contact_no: string;
    email: string;
    gst_no: string;
    pan_no: string;
    pan_proof: File | null;
    pincode: string;
    state_id: number | '';
    district_id: number | '';
    zone_name: string;
    bank_name: string;
    branch_name: string;
    account_no: string;
    ifsc_code: string;
    account_holder_name: string;
    bank_proof: File | null;
    address: string;
    username: string;
    password: string;
    password_confirmation: string;
    active_status: '1' | '0';
};

export type StateOption = { id: number; name: string };
export type DistrictOption = { id: number; name: string; state_id: number };

type VendorFormFieldsProps = {
    data: VendorFormData;
    setData: <K extends keyof VendorFormData>(
        key: K,
        value: VendorFormData[K],
    ) => void;
    errors: Partial<Record<keyof VendorFormData, string>>;
    states: StateOption[];
    districts: DistrictOption[];
    passwordRequired: boolean;
    existingPanProofUrl?: string | null;
    existingBankProofUrl?: string | null;
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const fileInputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-white outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-linear-to-r file:from-[var(--color-accent)] file:to-[var(--color-accent-2)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

function SectionHeading({ title }: { title: string }) {
    return (
        <div className="sm:col-span-2 lg:col-span-3">
            <h3 className="border-b border-[var(--color-gold)]/25 pb-1.5 text-sm font-semibold text-[var(--color-ink)]">
                {title}
            </h3>
        </div>
    );
}

export default function VendorFormFields({
    data,
    setData,
    errors,
    states,
    districts,
    passwordRequired,
    existingPanProofUrl,
    existingBankProofUrl,
}: VendorFormFieldsProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SectionHeading title="Company Details" />

            <div>
                <label htmlFor="company_name" className={labelClass}>
                    Company Name
                </label>
                <input
                    id="company_name"
                    type="text"
                    value={data.company_name}
                    onChange={(event) =>
                        setData('company_name', event.target.value)
                    }
                    placeholder="e.g. Acme Traders Pvt Ltd"
                    className={inputClass}
                />
                {errors.company_name && (
                    <p className={errorClass}>{errors.company_name}</p>
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
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className={inputClass}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="contact_no" className={labelClass}>
                    Contact No
                </label>
                <input
                    id="contact_no"
                    type="text"
                    value={data.contact_no}
                    onChange={(event) =>
                        setData('contact_no', event.target.value)
                    }
                    placeholder="e.g. 9876543210"
                    className={inputClass}
                />
                {errors.contact_no && (
                    <p className={errorClass}>{errors.contact_no}</p>
                )}
            </div>

            <div>
                <label htmlFor="alternate_contact_no" className={labelClass}>
                    Alternate Contact No
                </label>
                <input
                    id="alternate_contact_no"
                    type="text"
                    value={data.alternate_contact_no}
                    onChange={(event) =>
                        setData('alternate_contact_no', event.target.value)
                    }
                    placeholder="e.g. 9876500000"
                    className={inputClass}
                />
                {errors.alternate_contact_no && (
                    <p className={errorClass}>{errors.alternate_contact_no}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className={labelClass}>
                    Mail ID
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
                <label htmlFor="gst_no" className={labelClass}>
                    GST No
                </label>
                <input
                    id="gst_no"
                    type="text"
                    value={data.gst_no}
                    onChange={(event) => setData('gst_no', event.target.value)}
                    placeholder="e.g. 33ABCDE1234F1Z5"
                    className={inputClass}
                />
                {errors.gst_no && <p className={errorClass}>{errors.gst_no}</p>}
            </div>

            <SectionHeading title="Identity Proof" />

            <div>
                <label htmlFor="pan_no" className={labelClass}>
                    PAN No
                </label>
                <input
                    id="pan_no"
                    type="text"
                    value={data.pan_no}
                    onChange={(event) =>
                        setData('pan_no', event.target.value.toUpperCase())
                    }
                    placeholder="e.g. ABCDE1234F"
                    className={inputClass}
                />
                {errors.pan_no && <p className={errorClass}>{errors.pan_no}</p>}
            </div>

            <div className="sm:col-span-2">
                <label htmlFor="pan_proof" className={labelClass}>
                    PAN Proof
                </label>
                <input
                    id="pan_proof"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) =>
                        setData('pan_proof', event.target.files?.[0] ?? null)
                    }
                    className={fileInputClass}
                />
                {existingPanProofUrl && (
                    <a
                        href={existingPanProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-block text-xs font-medium text-[var(--color-gold)] hover:text-[var(--color-accent)]"
                    >
                        View current file
                    </a>
                )}
                {errors.pan_proof && (
                    <p className={errorClass}>{errors.pan_proof}</p>
                )}
            </div>

            <SectionHeading title="Address" />

            <div>
                <label htmlFor="pincode" className={labelClass}>
                    Pincode
                </label>
                <input
                    id="pincode"
                    type="text"
                    value={data.pincode}
                    onChange={(event) => setData('pincode', event.target.value)}
                    placeholder="e.g. 600001"
                    className={inputClass}
                />
                {errors.pincode && (
                    <p className={errorClass}>{errors.pincode}</p>
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
                <label htmlFor="zone_name" className={labelClass}>
                    Zone Name
                </label>
                <input
                    id="zone_name"
                    type="text"
                    value={data.zone_name}
                    onChange={(event) =>
                        setData('zone_name', event.target.value)
                    }
                    placeholder="e.g. Chennai"
                    className={inputClass}
                />
                {errors.zone_name && (
                    <p className={errorClass}>{errors.zone_name}</p>
                )}
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
                <label htmlFor="address" className={labelClass}>
                    Address
                </label>
                <textarea
                    id="address"
                    value={data.address}
                    onChange={(event) => setData('address', event.target.value)}
                    rows={2}
                    placeholder="e.g. 12 Main Street, Chennai"
                    className={inputClass}
                />
                {errors.address && (
                    <p className={errorClass}>{errors.address}</p>
                )}
            </div>

            <SectionHeading title="Bank Details" />

            <div>
                <label htmlFor="bank_name" className={labelClass}>
                    Bank Name
                </label>
                <input
                    id="bank_name"
                    type="text"
                    value={data.bank_name}
                    onChange={(event) =>
                        setData('bank_name', event.target.value)
                    }
                    placeholder="e.g. State Bank of India"
                    className={inputClass}
                />
                {errors.bank_name && (
                    <p className={errorClass}>{errors.bank_name}</p>
                )}
            </div>

            <div>
                <label htmlFor="branch_name" className={labelClass}>
                    Branch Name
                </label>
                <input
                    id="branch_name"
                    type="text"
                    value={data.branch_name}
                    onChange={(event) =>
                        setData('branch_name', event.target.value)
                    }
                    placeholder="e.g. Anna Salai"
                    className={inputClass}
                />
                {errors.branch_name && (
                    <p className={errorClass}>{errors.branch_name}</p>
                )}
            </div>

            <div>
                <label htmlFor="account_no" className={labelClass}>
                    Account No
                </label>
                <input
                    id="account_no"
                    type="text"
                    value={data.account_no}
                    onChange={(event) =>
                        setData('account_no', event.target.value)
                    }
                    placeholder="e.g. 123456789012"
                    className={inputClass}
                />
                {errors.account_no && (
                    <p className={errorClass}>{errors.account_no}</p>
                )}
            </div>

            <div>
                <label htmlFor="ifsc_code" className={labelClass}>
                    IFSC Code
                </label>
                <input
                    id="ifsc_code"
                    type="text"
                    value={data.ifsc_code}
                    onChange={(event) =>
                        setData('ifsc_code', event.target.value.toUpperCase())
                    }
                    placeholder="e.g. SBIN0001234"
                    className={inputClass}
                />
                {errors.ifsc_code && (
                    <p className={errorClass}>{errors.ifsc_code}</p>
                )}
            </div>

            <div>
                <label htmlFor="account_holder_name" className={labelClass}>
                    Account Holder Name
                </label>
                <input
                    id="account_holder_name"
                    type="text"
                    value={data.account_holder_name}
                    onChange={(event) =>
                        setData('account_holder_name', event.target.value)
                    }
                    placeholder="e.g. Rajesh Kumar"
                    className={inputClass}
                />
                {errors.account_holder_name && (
                    <p className={errorClass}>{errors.account_holder_name}</p>
                )}
            </div>

            <div>
                <label htmlFor="bank_proof" className={labelClass}>
                    Bank Proof
                </label>
                <input
                    id="bank_proof"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) =>
                        setData('bank_proof', event.target.files?.[0] ?? null)
                    }
                    className={fileInputClass}
                />
                {existingBankProofUrl && (
                    <a
                        href={existingBankProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-block text-xs font-medium text-[var(--color-gold)] hover:text-[var(--color-accent)]"
                    >
                        View current file
                    </a>
                )}
                {errors.bank_proof && (
                    <p className={errorClass}>{errors.bank_proof}</p>
                )}
            </div>

            <SectionHeading title="Login Credentials" />

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
                    placeholder="e.g. acme_traders"
                    className={inputClass}
                />
                {errors.username && (
                    <p className={errorClass}>{errors.username}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className={labelClass}>
                    {passwordRequired ? 'Password' : 'New Password (optional)'}
                </label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                        placeholder={
                            passwordRequired
                                ? 'Enter a password'
                                : 'Leave blank to keep current password'
                        }
                        className={`${inputClass} pr-11`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-gold)]/70 hover:text-[var(--color-accent)]"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>
                {errors.password && (
                    <p className={errorClass}>{errors.password}</p>
                )}
            </div>

            <div>
                <label htmlFor="password_confirmation" className={labelClass}>
                    Confirm Password
                </label>
                <div className="relative">
                    <input
                        id="password_confirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={data.password_confirmation}
                        onChange={(event) =>
                            setData('password_confirmation', event.target.value)
                        }
                        placeholder="Re-enter password"
                        className={`${inputClass} pr-11`}
                    />
                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword((value) => !value)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-gold)]/70 hover:text-[var(--color-accent)]"
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>
                {errors.password_confirmation && (
                    <p className={errorClass}>{errors.password_confirmation}</p>
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
