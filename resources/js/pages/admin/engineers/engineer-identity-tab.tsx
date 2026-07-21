import { errorClass, inputClass, labelClass } from './engineer-form-fields';
import type {
    EngineerFormData,
    EngineerFormErrors,
    EngineerSetData,
} from './engineer-form-fields';

type EngineerIdentityTabProps = {
    data: EngineerFormData;
    setData: EngineerSetData;
    errors: EngineerFormErrors;
    className?: string;
};

export default function EngineerIdentityTab({
    data,
    setData,
    errors,
    className,
}: EngineerIdentityTabProps) {
    return (
        <div
            className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${className ?? ''}`}
        >
            <div>
                <label htmlFor="aadhaar_number" className={labelClass}>
                    Aadhaar Number
                </label>
                <input
                    id="aadhaar_number"
                    type="text"
                    value={data.aadhaar_number}
                    onChange={(event) =>
                        setData('aadhaar_number', event.target.value)
                    }
                    placeholder="e.g. 123456789012"
                    className={inputClass}
                />
                {errors.aadhaar_number && (
                    <p className={errorClass}>{errors.aadhaar_number}</p>
                )}
            </div>

            <div>
                <label htmlFor="pan_number" className={labelClass}>
                    PAN Number
                </label>
                <input
                    id="pan_number"
                    type="text"
                    value={data.pan_number}
                    onChange={(event) =>
                        setData('pan_number', event.target.value.toUpperCase())
                    }
                    placeholder="e.g. ABCDE1234F"
                    className={inputClass}
                />
                {errors.pan_number && (
                    <p className={errorClass}>{errors.pan_number}</p>
                )}
            </div>
        </div>
    );
}
