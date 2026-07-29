import FileUploadField from '@/lib/file-upload-field';
import NumericInput from '@/lib/numeric-input';
import SearchableSelect from '@/lib/searchable-select';
import {
    errorClass,
    FINANCIAL_SECURITY_LABELS,
    FINANCIAL_SECURITY_TYPES,
    inputClass,
    labelClass,
    unitOptions,
    unitSelectClass,
} from './loa-form-fields';
import type {
    BankOption,
    FinancialSecuritiesExisting,
    FinancialSecuritySectionFormData,
    FinancialSecurityType,
    LoaFormData,
    LoaFormErrors,
    LoaSetData,
} from './loa-form-fields';

type LoaFinancialSecurityTabProps = {
    data: LoaFormData;
    setData: LoaSetData;
    errors: LoaFormErrors;
    banks: BankOption[];
    existing?: FinancialSecuritiesExisting;
    className?: string;
};

const claimPeriodUnitOptions: Array<'Days' | 'Months'> = ['Days', 'Months'];

function FinancialSecuritySection({
    type,
    section,
    errors,
    banks,
    existing,
    onChange,
}: {
    type: FinancialSecurityType;
    section: FinancialSecuritySectionFormData;
    errors: LoaFormErrors;
    banks: BankOption[];
    existing?: FinancialSecuritiesExisting[FinancialSecurityType];
    onChange: <K extends keyof FinancialSecuritySectionFormData>(
        field: K,
        value: FinancialSecuritySectionFormData[K],
    ) => void;
}) {
    const prefix = `financial_securities.${type}`;

    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/40 p-4 sm:p-5">
            <h3 className="mb-4 border-b border-[var(--color-gold)]/20 pb-3 text-base font-bold text-[var(--color-ink)]">
                {FINANCIAL_SECURITY_LABELS[type]}
            </h3>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label htmlFor={`${prefix}.amount`} className={labelClass}>
                        Amount
                    </label>
                    <div className="flex items-center gap-2.5">
                        <NumericInput
                            id={`${prefix}.amount`}
                            allowDecimal
                            min={0}
                            step="0.01"
                            value={section.amount}
                            onChange={(event) =>
                                onChange(
                                    'amount',
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value),
                                )
                            }
                            placeholder="e.g. 5.00"
                            className={inputClass}
                        />
                        <select
                            value={section.amount_unit}
                            onChange={(event) =>
                                onChange(
                                    'amount_unit',
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
                    {errors[`${prefix}.amount`] && (
                        <p className={errorClass}>
                            {errors[`${prefix}.amount`]}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor={`${prefix}.validity_start_date`}
                        className={labelClass}
                    >
                        BG Validity Start Date
                    </label>
                    <input
                        id={`${prefix}.validity_start_date`}
                        type="date"
                        value={section.validity_start_date}
                        onChange={(event) =>
                            onChange('validity_start_date', event.target.value)
                        }
                        className={inputClass}
                    />
                    {errors[`${prefix}.validity_start_date`] && (
                        <p className={errorClass}>
                            {errors[`${prefix}.validity_start_date`]}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor={`${prefix}.validity_end_date`}
                        className={labelClass}
                    >
                        BG Validity End Date
                    </label>
                    <input
                        id={`${prefix}.validity_end_date`}
                        type="date"
                        value={section.validity_end_date}
                        onChange={(event) =>
                            onChange('validity_end_date', event.target.value)
                        }
                        className={inputClass}
                    />
                    {errors[`${prefix}.validity_end_date`] && (
                        <p className={errorClass}>
                            {errors[`${prefix}.validity_end_date`]}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor={`${prefix}.claim_period`}
                        className={labelClass}
                    >
                        Claim Period
                    </label>
                    <div className="flex items-center gap-2.5">
                        <NumericInput
                            id={`${prefix}.claim_period`}
                            min={1}
                            step="1"
                            value={section.claim_period}
                            onChange={(event) =>
                                onChange(
                                    'claim_period',
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value),
                                )
                            }
                            placeholder="e.g. 90"
                            className={inputClass}
                        />
                        <select
                            value={section.claim_period_unit}
                            onChange={(event) =>
                                onChange(
                                    'claim_period_unit',
                                    event.target.value as 'Days' | 'Months',
                                )
                            }
                            className={unitSelectClass}
                        >
                            {claimPeriodUnitOptions.map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors[`${prefix}.claim_period`] && (
                        <p className={errorClass}>
                            {errors[`${prefix}.claim_period`]}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor={`${prefix}.bank_id`} className={labelClass}>
                        Bank Details
                    </label>
                    <SearchableSelect
                        id={`${prefix}.bank_id`}
                        value={section.bank_id}
                        options={banks}
                        onChange={(value) => onChange('bank_id', value)}
                        placeholder="Search for a bank…"
                    />
                    {errors[`${prefix}.bank_id`] && (
                        <p className={errorClass}>
                            {errors[`${prefix}.bank_id`]}
                        </p>
                    )}
                </div>

                <div>
                    <span className={labelClass}>Upload BG / EMD Document</span>
                    <FileUploadField
                        id={`${prefix}.file`}
                        file={section.file}
                        onChange={(file) => onChange('file', file)}
                        existingFileUrl={existing?.existing_file_url}
                        existingFileName={existing?.existing_file_name}
                        removeExisting={section.remove_file}
                        onRemoveExisting={(remove) =>
                            onChange('remove_file', remove)
                        }
                    />
                    {errors[`${prefix}.file`] && (
                        <p className={errorClass}>{errors[`${prefix}.file`]}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LoaFinancialSecurityTab({
    data,
    setData,
    errors,
    banks,
    existing,
    className,
}: LoaFinancialSecurityTabProps) {
    const updateSection = <
        Type extends FinancialSecurityType,
        K extends keyof FinancialSecuritySectionFormData,
    >(
        type: Type,
        field: K,
        value: FinancialSecuritySectionFormData[K],
    ) => {
        setData('financial_securities', {
            ...data.financial_securities,
            [type]: {
                ...data.financial_securities[type],
                [field]: value,
            },
        });
    };

    return (
        <div className={`space-y-6 ${className ?? ''}`}>
            {FINANCIAL_SECURITY_TYPES.map((type) => (
                <FinancialSecuritySection
                    key={type}
                    type={type}
                    section={data.financial_securities[type]}
                    errors={errors}
                    banks={banks}
                    existing={existing?.[type]}
                    onChange={(field, value) =>
                        updateSection(type, field, value)
                    }
                />
            ))}
        </div>
    );
}
