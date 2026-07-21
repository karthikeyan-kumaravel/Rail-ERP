import { errorClass, inputClass, labelClass } from './engineer-form-fields';
import type {
    EngineerFormData,
    EngineerFormErrors,
    EngineerSetData,
} from './engineer-form-fields';

type EngineerBankingTabProps = {
    data: EngineerFormData;
    setData: EngineerSetData;
    errors: EngineerFormErrors;
    className?: string;
};

export default function EngineerBankingTab({
    data,
    setData,
    errors,
    className,
}: EngineerBankingTabProps) {
    return (
        <div
            className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${className ?? ''}`}
        >
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
                    Branch
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
                <label htmlFor="account_number" className={labelClass}>
                    Account Number
                </label>
                <input
                    id="account_number"
                    type="text"
                    value={data.account_number}
                    onChange={(event) =>
                        setData('account_number', event.target.value)
                    }
                    placeholder="e.g. 123456789012"
                    className={inputClass}
                />
                {errors.account_number && (
                    <p className={errorClass}>{errors.account_number}</p>
                )}
            </div>

            <div>
                <label
                    htmlFor="account_number_confirmation"
                    className={labelClass}
                >
                    Confirm Account Number
                </label>
                <input
                    id="account_number_confirmation"
                    type="text"
                    value={data.account_number_confirmation}
                    onChange={(event) =>
                        setData(
                            'account_number_confirmation',
                            event.target.value,
                        )
                    }
                    placeholder="Re-enter account number"
                    className={inputClass}
                />
                {data.account_number_confirmation !== '' &&
                    data.account_number_confirmation !==
                        data.account_number && (
                        <p className={errorClass}>
                            Account numbers do not match.
                        </p>
                    )}
                {errors.account_number_confirmation && (
                    <p className={errorClass}>
                        {errors.account_number_confirmation}
                    </p>
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
        </div>
    );
}
