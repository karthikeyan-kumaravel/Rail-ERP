import {
    EMPLOYEE_STATUSES,
    errorClass,
    inputClass,
    labelClass,
} from './engineer-form-fields';
import type {
    EngineerFormData,
    EngineerFormErrors,
    EngineerSetData,
    EngineerTypeOption,
} from './engineer-form-fields';

type EngineerEmploymentTabProps = {
    data: EngineerFormData;
    setData: EngineerSetData;
    errors: EngineerFormErrors;
    engineerTypes: EngineerTypeOption[];
    className?: string;
};

export default function EngineerEmploymentTab({
    data,
    setData,
    errors,
    engineerTypes,
    className,
}: EngineerEmploymentTabProps) {
    return (
        <div
            className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${className ?? ''}`}
        >
            <div>
                <label htmlFor="date_of_joining" className={labelClass}>
                    Date of Joining *
                </label>
                <input
                    id="date_of_joining"
                    type="date"
                    value={data.date_of_joining}
                    onChange={(event) =>
                        setData('date_of_joining', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.date_of_joining && (
                    <p className={errorClass}>{errors.date_of_joining}</p>
                )}
            </div>

            <div>
                <label htmlFor="employee_status" className={labelClass}>
                    Employee Status
                </label>
                <select
                    id="employee_status"
                    value={data.employee_status}
                    onChange={(event) =>
                        setData(
                            'employee_status',
                            event.target
                                .value as EngineerFormData['employee_status'],
                        )
                    }
                    className={inputClass}
                >
                    {EMPLOYEE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
                {errors.employee_status && (
                    <p className={errorClass}>{errors.employee_status}</p>
                )}
            </div>

            <div>
                <label htmlFor="engineer_type_id" className={labelClass}>
                    Engineer Type
                </label>
                <select
                    id="engineer_type_id"
                    value={data.engineer_type_id}
                    onChange={(event) =>
                        setData(
                            'engineer_type_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={inputClass}
                >
                    <option value="">Select engineer type</option>
                    {engineerTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
                {errors.engineer_type_id && (
                    <p className={errorClass}>{errors.engineer_type_id}</p>
                )}
            </div>
        </div>
    );
}
