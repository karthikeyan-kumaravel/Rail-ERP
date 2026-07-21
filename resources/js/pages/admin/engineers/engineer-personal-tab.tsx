import { useMemo } from 'react';
import {
    BLOOD_GROUPS,
    calculateAge,
    errorClass,
    GENDERS,
    inputClass,
    labelClass,
    MARITAL_STATUSES,
} from './engineer-form-fields';
import type {
    EngineerFormData,
    EngineerFormErrors,
    EngineerSetData,
} from './engineer-form-fields';

type EngineerPersonalTabProps = {
    data: EngineerFormData;
    setData: EngineerSetData;
    errors: EngineerFormErrors;
    employeeCode?: string | null;
    className?: string;
};

export default function EngineerPersonalTab({
    data,
    setData,
    errors,
    employeeCode,
    className,
}: EngineerPersonalTabProps) {
    const age = useMemo(
        () => calculateAge(data.date_of_birth),
        [data.date_of_birth],
    );

    return (
        <div
            className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${className ?? ''}`}
        >
            <div>
                <label htmlFor="employee_code" className={labelClass}>
                    Employee ID
                </label>
                <input
                    id="employee_code"
                    type="text"
                    value={employeeCode ?? 'Auto-generated on save'}
                    disabled
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="full_name" className={labelClass}>
                    Full Name *
                </label>
                <input
                    id="full_name"
                    type="text"
                    value={data.full_name}
                    onChange={(event) =>
                        setData('full_name', event.target.value)
                    }
                    placeholder="e.g. Rajesh Kumar"
                    className={inputClass}
                />
                {errors.full_name && (
                    <p className={errorClass}>{errors.full_name}</p>
                )}
            </div>

            <div>
                <label htmlFor="gender" className={labelClass}>
                    Gender
                </label>
                <select
                    id="gender"
                    value={data.gender}
                    onChange={(event) =>
                        setData(
                            'gender',
                            event.target.value as EngineerFormData['gender'],
                        )
                    }
                    className={inputClass}
                >
                    <option value="">Select gender</option>
                    {GENDERS.map((gender) => (
                        <option key={gender} value={gender}>
                            {gender}
                        </option>
                    ))}
                </select>
                {errors.gender && <p className={errorClass}>{errors.gender}</p>}
            </div>

            <div>
                <label htmlFor="date_of_birth" className={labelClass}>
                    Date of Birth *
                </label>
                <input
                    id="date_of_birth"
                    type="date"
                    value={data.date_of_birth}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(event) =>
                        setData('date_of_birth', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.date_of_birth && (
                    <p className={errorClass}>{errors.date_of_birth}</p>
                )}
            </div>

            <div>
                <label htmlFor="age" className={labelClass}>
                    Age
                </label>
                <input
                    id="age"
                    type="text"
                    value={age}
                    disabled
                    placeholder="Calculated from date of birth"
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="blood_group" className={labelClass}>
                    Blood Group
                </label>
                <select
                    id="blood_group"
                    value={data.blood_group}
                    onChange={(event) =>
                        setData('blood_group', event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((group) => (
                        <option key={group} value={group}>
                            {group}
                        </option>
                    ))}
                </select>
                {errors.blood_group && (
                    <p className={errorClass}>{errors.blood_group}</p>
                )}
            </div>

            <div>
                <label htmlFor="nationality" className={labelClass}>
                    Nationality
                </label>
                <input
                    id="nationality"
                    type="text"
                    value={data.nationality}
                    onChange={(event) =>
                        setData('nationality', event.target.value)
                    }
                    placeholder="e.g. Indian"
                    className={inputClass}
                />
                {errors.nationality && (
                    <p className={errorClass}>{errors.nationality}</p>
                )}
            </div>

            <div>
                <label htmlFor="marital_status" className={labelClass}>
                    Marital Status
                </label>
                <select
                    id="marital_status"
                    value={data.marital_status}
                    onChange={(event) =>
                        setData('marital_status', event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">Select marital status</option>
                    {MARITAL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
                {errors.marital_status && (
                    <p className={errorClass}>{errors.marital_status}</p>
                )}
            </div>
        </div>
    );
}
