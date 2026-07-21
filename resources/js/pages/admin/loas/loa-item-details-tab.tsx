import type {
    LoaFormData,
    LoaFormErrors,
    ScheduleNameOption,
    ScheduleTypeOption,
    UnitOption,
} from './loa-form-fields';
import LoaItemsImportSection from './loa-items-import-section';

type LoaItemDetailsTabProps = {
    data: LoaFormData;
    errors: LoaFormErrors;
    scheduleNames: ScheduleNameOption[];
    scheduleTypes: ScheduleTypeOption[];
    units: UnitOption[];
    onItemsChange: (items: LoaFormData['items']) => void;
    className?: string;
};

export default function LoaItemDetailsTab({
    data,
    errors,
    scheduleNames,
    scheduleTypes,
    units,
    onItemsChange,
    className,
}: LoaItemDetailsTabProps) {
    return (
        <div className={className}>
            <LoaItemsImportSection
                items={data.items}
                errors={errors}
                scheduleNames={scheduleNames}
                scheduleTypes={scheduleTypes}
                units={units}
                onItemsChange={onItemsChange}
            />
        </div>
    );
}
