import {
    errorClass,
    inputClass,
    labelClass,
    unitOptions,
    unitSelectClass,
} from './loa-form-fields';
import type { LoaFormData, LoaFormErrors, LoaSetData } from './loa-form-fields';

type LoaFinancialSecurityTabProps = {
    data: LoaFormData;
    setData: LoaSetData;
    errors: LoaFormErrors;
    className?: string;
};

const mobilizationAdvanceStatusOptions: Array<
    'Pending' | 'Requested' | 'Received'
> = ['Pending', 'Requested', 'Received'];

export default function LoaFinancialSecurityTab({
    data,
    setData,
    errors,
    className,
}: LoaFinancialSecurityTabProps) {
    return (
        <div
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className ?? ''}`}
        >
            <div>
                <label htmlFor="bg_amount" className={labelClass}>
                    BG Amount
                </label>
                <div className="flex items-center gap-2.5">
                    <input
                        id="bg_amount"
                        type="number"
                        min={0}
                        step="0.01"
                        value={data.bg_amount}
                        onChange={(event) =>
                            setData(
                                'bg_amount',
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                        placeholder="e.g. 10.00"
                        className={inputClass}
                    />
                    <select
                        value={data.bg_amount_unit}
                        onChange={(event) =>
                            setData(
                                'bg_amount_unit',
                                event.target.value as 'Cr' | 'L',
                            )
                        }
                        className={unitSelectClass}
                    >
                        {unitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                                {unit}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.bg_amount && (
                    <p className={errorClass}>{errors.bg_amount}</p>
                )}
                {errors.bg_amount_unit && (
                    <p className={errorClass}>{errors.bg_amount_unit}</p>
                )}
            </div>

            <div>
                <label htmlFor="bg_validity" className={labelClass}>
                    BG Validity
                </label>
                <input
                    id="bg_validity"
                    type="date"
                    value={data.bg_validity}
                    onChange={(event) =>
                        setData('bg_validity', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.bg_validity && (
                    <p className={errorClass}>{errors.bg_validity}</p>
                )}
            </div>

            <div>
                <label htmlFor="security_deposit_amount" className={labelClass}>
                    Security Deposit
                </label>
                <div className="flex items-center gap-2.5">
                    <input
                        id="security_deposit_amount"
                        type="number"
                        min={0}
                        step="0.01"
                        value={data.security_deposit_amount}
                        onChange={(event) =>
                            setData(
                                'security_deposit_amount',
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                        placeholder="e.g. 5.00"
                        className={inputClass}
                    />
                    <select
                        value={data.security_deposit_unit}
                        onChange={(event) =>
                            setData(
                                'security_deposit_unit',
                                event.target.value as 'Cr' | 'L',
                            )
                        }
                        className={unitSelectClass}
                    >
                        {unitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                                {unit}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.security_deposit_amount && (
                    <p className={errorClass}>
                        {errors.security_deposit_amount}
                    </p>
                )}
                {errors.security_deposit_unit && (
                    <p className={errorClass}>{errors.security_deposit_unit}</p>
                )}
            </div>

            <div>
                <label
                    htmlFor="mobilization_advance_amount"
                    className={labelClass}
                >
                    Mobilization Advance
                </label>
                <div className="flex items-center gap-2.5">
                    <input
                        id="mobilization_advance_amount"
                        type="number"
                        min={0}
                        step="0.01"
                        value={data.mobilization_advance_amount}
                        onChange={(event) =>
                            setData(
                                'mobilization_advance_amount',
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                        placeholder="e.g. 2.00"
                        className={inputClass}
                    />
                    <select
                        value={data.mobilization_advance_unit}
                        onChange={(event) =>
                            setData(
                                'mobilization_advance_unit',
                                event.target.value as 'Cr' | 'L',
                            )
                        }
                        className={unitSelectClass}
                    >
                        {unitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                                {unit}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.mobilization_advance_amount && (
                    <p className={errorClass}>
                        {errors.mobilization_advance_amount}
                    </p>
                )}
                {errors.mobilization_advance_unit && (
                    <p className={errorClass}>
                        {errors.mobilization_advance_unit}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="mobilization_advance_status"
                    className={labelClass}
                >
                    Mob. Advance Status
                </label>
                <select
                    id="mobilization_advance_status"
                    value={data.mobilization_advance_status}
                    onChange={(event) =>
                        setData(
                            'mobilization_advance_status',
                            event.target.value as
                                'Pending' | 'Requested' | 'Received',
                        )
                    }
                    className={inputClass}
                >
                    {mobilizationAdvanceStatusOptions.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
                {errors.mobilization_advance_status && (
                    <p className={errorClass}>
                        {errors.mobilization_advance_status}
                    </p>
                )}
            </div>
        </div>
    );
}
