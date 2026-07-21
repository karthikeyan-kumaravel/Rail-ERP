import { inputClass, labelClass } from './loa-form-fields';
import type { LoaStationFormData, StationOption } from './loa-form-fields';

const buttonClass =
    'rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
const primaryButtonClass = `${buttonClass} bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-lg hover:brightness-110`;

type LoaStationsPickerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    stations: LoaStationFormData[];
    stationOptions: StationOption[];
    divisionId: number | '';
    divisionName?: string;
    onChangeStation: (index: number, stationId: number | '') => void;
};

export default function LoaStationsPickerModal({
    isOpen,
    onClose,
    stations,
    stationOptions,
    divisionId,
    divisionName,
    onChangeStation,
}: LoaStationsPickerModalProps) {
    if (!isOpen) {
        return null;
    }

    const visibleStationOptions = divisionId
        ? stationOptions.filter((station) => station.division_id === divisionId)
        : stationOptions;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/55 p-4 print:hidden">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-surface)] shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--color-gold)]/20 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                            Select Stations
                        </h2>
                        <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                            Pick a station name for each of the{' '}
                            {stations.length} stations.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-2 py-1 text-xl leading-none text-[var(--color-ink)]/55 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-accent)]"
                        aria-label="Close station picker"
                    >
                        x
                    </button>
                </div>

                <div className="max-h-[calc(92vh-140px)] overflow-y-auto px-6 py-5">
                    {visibleStationOptions.length === 0 && (
                        <div className="mb-4 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-4 py-3 text-sm text-[var(--color-ink)]">
                            No stations found
                            {divisionName ? ` for ${divisionName}` : ''} in the
                            Station master. Add stations for this division under
                            Admin &rarr; Stations first.
                        </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {stations.map((station, index) => (
                            <div key={index}>
                                <label
                                    htmlFor={`loa-station-${index}`}
                                    className={labelClass}
                                >
                                    Station {index + 1}
                                </label>
                                <select
                                    id={`loa-station-${index}`}
                                    value={station.station_id}
                                    onChange={(event) =>
                                        onChangeStation(
                                            index,
                                            event.target.value
                                                ? Number(event.target.value)
                                                : '',
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select a station</option>
                                    {visibleStationOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[var(--color-gold)]/20 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className={primaryButtonClass}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
