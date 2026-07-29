import { useEffect, useState } from 'react';
import { TrainIcon } from '@/lib/icons';
import NumericInput from '@/lib/numeric-input';
import {
    errorClass,
    inputClass,
    labelClass,
    unitOptions,
    unitSelectClass,
} from './loa-form-fields';
import type {
    DivisionOption,
    LoaFormData,
    LoaFormErrors,
    LoaSetData,
    StationOption,
    VendorOption,
} from './loa-form-fields';
import LoaStationsPickerModal from './loa-stations-picker-modal';

type LoaDetailsTabProps = {
    data: LoaFormData;
    setData: LoaSetData;
    errors: LoaFormErrors;
    divisions: DivisionOption[];
    vendors: VendorOption[];
    stations: StationOption[];
    className?: string;
};

export default function LoaDetailsTab({
    data,
    setData,
    errors,
    divisions,
    vendors,
    stations,
    className,
}: LoaDetailsTabProps) {
    const [isStationsModalOpen, setIsStationsModalOpen] = useState(false);
    const totalStationsCount = Number(data.total_stations) || 0;

    useEffect(() => {
        if (data.stations.length === totalStationsCount) {
            return;
        }

        if (data.stations.length < totalStationsCount) {
            setData('stations', [
                ...data.stations,
                ...Array.from(
                    { length: totalStationsCount - data.stations.length },
                    () => ({ station_id: '' as const }),
                ),
            ]);
        } else {
            setData('stations', data.stations.slice(0, totalStationsCount));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalStationsCount]);

    const handleStationChange = (index: number, stationId: number | '') => {
        setData(
            'stations',
            data.stations.map((station, i) =>
                i === index ? { station_id: stationId } : station,
            ),
        );
    };
    const handleVendorChange = (value: string) => {
        const vendorId = value ? Number(value) : '';
        setData('vendor_id', vendorId);

        const vendor = vendors.find((candidate) => candidate.id === vendorId);
        setData('client', vendor?.name ?? '');
    };

    return (
        <div
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className ?? ''}`}
        >
            <div>
                <label htmlFor="loa_number" className={labelClass}>
                    LOA Number
                </label>
                <input
                    id="loa_number"
                    type="text"
                    value={data.loa_number}
                    onChange={(event) =>
                        setData('loa_number', event.target.value)
                    }
                    placeholder="e.g. RAILWAY/RAN/2024/001"
                    className={inputClass}
                />
                {errors.loa_number && (
                    <p className={errorClass}>{errors.loa_number}</p>
                )}
            </div>

            <div>
                <label htmlFor="loa_date" className={labelClass}>
                    LOA Date
                </label>
                <input
                    id="loa_date"
                    type="date"
                    value={data.loa_date}
                    onChange={(event) =>
                        setData('loa_date', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.loa_date && (
                    <p className={errorClass}>{errors.loa_date}</p>
                )}
            </div>

            <div>
                <label htmlFor="client" className={labelClass}>
                    Client
                </label>
                <select
                    id="client"
                    value={data.vendor_id}
                    onChange={(event) => handleVendorChange(event.target.value)}
                    className={inputClass}
                >
                    <option value="">Select a client</option>
                    {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                        </option>
                    ))}
                </select>
                {!data.vendor_id && data.client && (
                    <p className="mt-1.5 text-xs text-[var(--color-ink)]/55">
                        Current: {data.client} (not in vendor master — pick a
                        client above to update)
                    </p>
                )}
                {errors.vendor_id && (
                    <p className={errorClass}>{errors.vendor_id}</p>
                )}
                {errors.client && <p className={errorClass}>{errors.client}</p>}
            </div>

            <div>
                <label htmlFor="division_id" className={labelClass}>
                    Division
                </label>
                <select
                    id="division_id"
                    value={data.division_id}
                    onChange={(event) =>
                        setData(
                            'division_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={inputClass}
                >
                    <option value="">Select a division</option>
                    {divisions.map((division) => (
                        <option key={division.id} value={division.id}>
                            {division.name}
                        </option>
                    ))}
                </select>
                {errors.division_id && (
                    <p className={errorClass}>{errors.division_id}</p>
                )}
            </div>

            <div>
                <label htmlFor="work_type" className={labelClass}>
                    Work Type
                </label>
                <input
                    id="work_type"
                    type="text"
                    value={data.work_type}
                    onChange={(event) =>
                        setData('work_type', event.target.value)
                    }
                    placeholder="e.g. Track Renewal"
                    className={inputClass}
                />
                {errors.work_type && (
                    <p className={errorClass}>{errors.work_type}</p>
                )}
            </div>

            <div>
                <label htmlFor="contract_value_amount" className={labelClass}>
                    Contract Value
                </label>
                <div className="flex items-center gap-2.5">
                    <NumericInput
                        id="contract_value_amount"
                        allowDecimal
                        min={0}
                        step="0.01"
                        value={data.contract_value_amount}
                        onChange={(event) =>
                            setData(
                                'contract_value_amount',
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                        placeholder="e.g. 3.50"
                        className={inputClass}
                    />
                    <select
                        value={data.contract_value_unit}
                        onChange={(event) =>
                            setData(
                                'contract_value_unit',
                                event.target.value as 'Cr' | 'L',
                            )
                        }
                        className={unitSelectClass}
                    >
                        {unitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                                {unit}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.contract_value_amount && (
                    <p className={errorClass}>{errors.contract_value_amount}</p>
                )}
                {errors.contract_value_unit && (
                    <p className={errorClass}>{errors.contract_value_unit}</p>
                )}
            </div>

            <div>
                <label
                    htmlFor="completion_period_months"
                    className={labelClass}
                >
                    Completion Period (Months)
                </label>
                <NumericInput
                    id="completion_period_months"
                    min={0}
                    value={data.completion_period_months}
                    onChange={(event) =>
                        setData(
                            'completion_period_months',
                            event.target.value === ''
                                ? ''
                                : Number(event.target.value),
                        )
                    }
                    placeholder="e.g. 18"
                    className={inputClass}
                />
                {errors.completion_period_months && (
                    <p className={errorClass}>
                        {errors.completion_period_months}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="defect_liability_months" className={labelClass}>
                    Defect Liability (Months)
                </label>
                <NumericInput
                    id="defect_liability_months"
                    min={0}
                    value={data.defect_liability_months}
                    onChange={(event) =>
                        setData(
                            'defect_liability_months',
                            event.target.value === ''
                                ? ''
                                : Number(event.target.value),
                        )
                    }
                    placeholder="e.g. 24"
                    className={inputClass}
                />
                {errors.defect_liability_months && (
                    <p className={errorClass}>
                        {errors.defect_liability_months}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="start_date" className={labelClass}>
                    Start Date
                </label>
                <input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(event) =>
                        setData('start_date', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.start_date && (
                    <p className={errorClass}>{errors.start_date}</p>
                )}
            </div>

            <div>
                <label htmlFor="end_date" className={labelClass}>
                    End Date
                </label>
                <input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={(event) =>
                        setData('end_date', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.end_date && (
                    <p className={errorClass}>{errors.end_date}</p>
                )}
            </div>

            <div>
                <label htmlFor="total_stations" className={labelClass}>
                    Total Stations
                </label>
                <div className="flex items-center gap-2.5">
                    <NumericInput
                        id="total_stations"
                        min={0}
                        value={data.total_stations}
                        onChange={(event) =>
                            setData(
                                'total_stations',
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                        placeholder="e.g. 12"
                        className={inputClass}
                    />
                    {totalStationsCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsStationsModalOpen(true)}
                            title="Select station names"
                            aria-label="Select station names"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-gold)]/25 text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                        >
                            <TrainIcon />
                        </button>
                    )}
                </div>
                {errors.total_stations && (
                    <p className={errorClass}>{errors.total_stations}</p>
                )}
            </div>

            <div>
                <label htmlFor="completion_date" className={labelClass}>
                    Completion Date
                </label>
                <input
                    id="completion_date"
                    type="date"
                    value={data.completion_date}
                    onChange={(event) =>
                        setData('completion_date', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.completion_date && (
                    <p className={errorClass}>{errors.completion_date}</p>
                )}
            </div>

            <div>
                <label htmlFor="extension_date" className={labelClass}>
                    Extension Date
                </label>
                <input
                    id="extension_date"
                    type="date"
                    value={data.extension_date}
                    onChange={(event) =>
                        setData('extension_date', event.target.value)
                    }
                    className={inputClass}
                />
                {errors.extension_date && (
                    <p className={errorClass}>{errors.extension_date}</p>
                )}
            </div>

            <div>
                <label htmlFor="active_status" className={labelClass}>
                    Active Status
                </label>
                <select
                    id="active_status"
                    value={data.active_status}
                    onChange={(event) =>
                        setData(
                            'active_status',
                            event.target.value === '1' ? '1' : '0',
                        )
                    }
                    className={inputClass}
                >
                    <option value="1">Active</option>
                    <option value="0">In active</option>
                </select>
                {errors.active_status && (
                    <p className={errorClass}>{errors.active_status}</p>
                )}
            </div>

            <LoaStationsPickerModal
                isOpen={isStationsModalOpen}
                onClose={() => setIsStationsModalOpen(false)}
                stations={data.stations}
                stationOptions={stations}
                divisionId={data.division_id}
                divisionName={
                    divisions.find(
                        (division) => division.id === data.division_id,
                    )?.name
                }
                onChangeStation={handleStationChange}
            />
        </div>
    );
}
