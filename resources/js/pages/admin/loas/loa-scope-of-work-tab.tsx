import { errorClass, inputClass, labelClass } from './loa-form-fields';
import type { LoaFormData, LoaFormErrors, LoaSetData } from './loa-form-fields';

type LoaScopeOfWorkTabProps = {
    data: LoaFormData;
    setData: LoaSetData;
    errors: LoaFormErrors;
    className?: string;
};

export default function LoaScopeOfWorkTab({
    data,
    setData,
    errors,
    className,
}: LoaScopeOfWorkTabProps) {
    return (
        <div className={className}>
            <label htmlFor="scope_of_work" className={labelClass}>
                Scope of Work
            </label>
            <textarea
                id="scope_of_work"
                rows={8}
                value={data.scope_of_work}
                onChange={(event) =>
                    setData('scope_of_work', event.target.value)
                }
                placeholder="Describe the scope of work for this LOA / PO..."
                className={`${inputClass} resize-y`}
            />
            {errors.scope_of_work && (
                <p className={errorClass}>{errors.scope_of_work}</p>
            )}
        </div>
    );
}
