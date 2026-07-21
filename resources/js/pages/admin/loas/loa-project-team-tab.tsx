import { errorClass, inputClass, labelClass } from './loa-form-fields';
import type {
    LoaFormData,
    LoaFormErrors,
    LoaTeamMemberFormData,
} from './loa-form-fields';

type LoaProjectTeamTabProps = {
    data: LoaFormData;
    errors: LoaFormErrors;
    addTeamMember: () => void;
    removeTeamMember: (index: number) => void;
    updateTeamMember: (
        index: number,
        field: keyof LoaTeamMemberFormData,
        value: string,
    ) => void;
    className?: string;
};

export default function LoaProjectTeamTab({
    data,
    errors,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    className,
}: LoaProjectTeamTabProps) {
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
                                htmlFor={`team-${index}-name`}
                                className={labelClass}
                            >
                                Name
                            </label>
                            <input
                                id={`team-${index}-name`}
                                type="text"
                                value={member.name}
                                onChange={(event) =>
                                    updateTeamMember(
                                        index,
                                        'name',
                                        event.target.value,
                                    )
                                }
                                placeholder="e.g. Ramesh Kumar"
                                className={inputClass}
                            />
                            {errors[`team.${index}.name`] && (
                                <p className={errorClass}>
                                    {errors[`team.${index}.name`]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor={`team-${index}-role`}
                                className={labelClass}
                            >
                                Role
                            </label>
                            <input
                                id={`team-${index}-role`}
                                type="text"
                                value={member.role}
                                onChange={(event) =>
                                    updateTeamMember(
                                        index,
                                        'role',
                                        event.target.value,
                                    )
                                }
                                placeholder="e.g. Project Manager"
                                className={inputClass}
                            />
                            {errors[`team.${index}.role`] && (
                                <p className={errorClass}>
                                    {errors[`team.${index}.role`]}
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
