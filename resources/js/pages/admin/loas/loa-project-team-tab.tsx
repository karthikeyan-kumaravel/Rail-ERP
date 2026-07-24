import EngineerCombobox from '@/lib/engineer-combobox';
import type { EngineerSearchResult } from '@/lib/engineer-combobox';
import { errorClass, labelClass } from './loa-form-fields';
import type {
    EngineerTypeOption,
    LoaFormData,
    LoaFormErrors,
    LoaTeamMemberFormData,
} from './loa-form-fields';

type LoaProjectTeamTabProps = {
    data: LoaFormData;
    errors: LoaFormErrors;
    engineerTypes: EngineerTypeOption[];
    addTeamMember: () => void;
    removeTeamMember: (index: number) => void;
    updateTeamMember: (
        index: number,
        patch: Partial<LoaTeamMemberFormData>,
    ) => void;
    className?: string;
};

export default function LoaProjectTeamTab({
    data,
    errors,
    engineerTypes,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    className,
}: LoaProjectTeamTabProps) {
    const handleEngineerSelect = (
        index: number,
        engineer: EngineerSearchResult,
    ) => {
        updateTeamMember(index, {
            engineer_id: engineer.id,
            name: engineer.full_name,
            engineer_type_id: engineer.engineer_type_id ?? '',
            role: engineer.engineer_type ?? '',
        });
    };

    const handleRoleChange = (index: number, engineerTypeId: number | '') => {
        const engineerType = engineerTypes.find(
            (type) => type.id === engineerTypeId,
        );

        updateTeamMember(index, {
            engineer_type_id: engineerTypeId,
            role: engineerType?.name ?? '',
        });
    };

    return (
        <div className={className}>
            <div className="space-y-4">
                {data.team.map((member, index) => (
                    <div
                        key={index}
                        className="grid gap-4 rounded-lg border border-[var(--color-gold)]/20 bg-[var(--color-surface-soft)]/40 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
                    >
                        <div>
                            <label
                                htmlFor={`team.${index}.engineer_id`}
                                className={labelClass}
                            >
                                Name
                            </label>
                            <EngineerCombobox
                                id={`team.${index}.engineer_id`}
                                value={member.engineer_id}
                                displayLabel={member.name}
                                onSelect={(engineer) =>
                                    handleEngineerSelect(index, engineer)
                                }
                                placeholder="Search engineer…"
                            />
                            {errors[`team.${index}.engineer_id`] && (
                                <p className={errorClass}>
                                    {errors[`team.${index}.engineer_id`]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor={`team.${index}.engineer_type_id`}
                                className={labelClass}
                            >
                                Role
                            </label>
                            <select
                                id={`team.${index}.engineer_type_id`}
                                value={member.engineer_type_id}
                                onChange={(event) =>
                                    handleRoleChange(
                                        index,
                                        event.target.value
                                            ? Number(event.target.value)
                                            : '',
                                    )
                                }
                                className="w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
                            >
                                <option value="">Select role…</option>
                                {engineerTypes.map((engineerType) => (
                                    <option
                                        key={engineerType.id}
                                        value={engineerType.id}
                                    >
                                        {engineerType.name}
                                    </option>
                                ))}
                            </select>
                            {errors[`team.${index}.engineer_type_id`] && (
                                <p className={errorClass}>
                                    {errors[`team.${index}.engineer_type_id`]}
                                </p>
                            )}
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                disabled={data.team.length <= 1}
                                className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-500/90 transition hover:border-red-500/50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addTeamMember}
                className="mt-4 rounded-lg border border-[var(--color-gold)]/25 px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
            >
                + Add Team Member
            </button>
        </div>
    );
}
