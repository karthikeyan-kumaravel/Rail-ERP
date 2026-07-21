import MultiSelectSearch from '@/lib/multi-select';
import {
    errorClass,
    labelClass,
    LANGUAGE_OPTIONS,
} from './engineer-form-fields';
import type {
    EngineerFormData,
    EngineerFormErrors,
    EngineerSetData,
} from './engineer-form-fields';

type EngineerAdditionalTabProps = {
    data: EngineerFormData;
    setData: EngineerSetData;
    errors: EngineerFormErrors;
    className?: string;
};

export default function EngineerAdditionalTab({
    data,
    setData,
    errors,
    className,
}: EngineerAdditionalTabProps) {
    return (
        <div
            className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${className ?? ''}`}
        >
            <div className="md:col-span-2">
                <label htmlFor="languages_known" className={labelClass}>
                    Languages Known
                </label>
                <MultiSelectSearch
                    id="languages_known"
                    options={LANGUAGE_OPTIONS}
                    selected={data.languages_known}
                    onChange={(value) => setData('languages_known', value)}
                    placeholder="Search languages..."
                />
                {errors.languages_known && (
                    <p className={errorClass}>{errors.languages_known}</p>
                )}
            </div>
        </div>
    );
}
