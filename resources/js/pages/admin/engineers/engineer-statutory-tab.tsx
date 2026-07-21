import { errorClass, inputClass, labelClass } from './engineer-form-fields';
import type {
    EngineerFormData,
    EngineerFormErrors,
    EngineerSetData,
} from './engineer-form-fields';

type EngineerStatutoryTabProps = {
    data: EngineerFormData;
    setData: EngineerSetData;
    errors: EngineerFormErrors;
    className?: string;
};

export default function EngineerStatutoryTab({
    data,
    setData,
    errors,
    className,
}: EngineerStatutoryTabProps) {
    return (
        <div
            className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${className ?? ''}`}
        >
            <div>
                <label htmlFor="pf_account_number" className={labelClass}>
                    PF Account Number
                </label>
                <input
                    id="pf_account_number"
                    type="text"
                    value={data.pf_account_number}
                    onChange={(event) =>
                        setData('pf_account_number', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.pf_account_number && (
                    <p className={errorClass}>{errors.pf_account_number}</p>
                )}
            </div>

            <div>
                <label htmlFor="esi_account_number" className={labelClass}>
                    ESI Account Number
                </label>
                <input
                    id="esi_account_number"
                    type="text"
                    value={data.esi_account_number}
                    onChange={(event) =>
                        setData('esi_account_number', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.esi_account_number && (
                    <p className={errorClass}>{errors.esi_account_number}</p>
                )}
            </div>
        </div>
    );
}
