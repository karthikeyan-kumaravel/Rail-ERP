<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $loa->loa_number }}</title>
    <style>
        @page { margin: 28px 32px; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; color: #0f2436; }
        h1 { font-size: 18px; margin: 0 0 2px; }
        h2 { font-size: 13px; margin: 0 0 8px; padding-bottom: 6px; border-bottom: 1px solid #e0a94a; }
        .subtitle { color: #6b7280; font-size: 11px; margin: 0 0 16px; }
        .section { margin-bottom: 16px; }
        table.details { width: 100%; border-collapse: collapse; }
        table.details td { padding: 4px 6px; vertical-align: top; }
        table.details td.label { color: #6b7280; width: 34%; font-size: 10px; text-transform: uppercase; }
        table.details td.value { font-weight: bold; }
        .columns { width: 100%; }
        .columns td { vertical-align: top; width: 50%; padding-right: 12px; }
        table.grid { width: 100%; border-collapse: collapse; }
        table.grid th { background: #0f2436; color: #ffffff; font-size: 9.5px; text-transform: uppercase; padding: 5px 6px; text-align: left; }
        table.grid td { padding: 5px 6px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        table.grid td.num { text-align: right; }
        tr.schedule td { background: #f3ede0; font-weight: bold; }
        tr.schedule-total td { background: #ede7d8; font-weight: bold; border-top: 1px solid #e0a94a; }
        .schedule-caption { margin: 0 0 8px; padding: 6px 8px; background: #f3ede0; font-weight: bold; }
        .status { display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 9.5px; font-weight: bold; }
        .status.active { background: #fdf0d5; color: #8a6d10; }
        .status.inactive { background: #fde2e2; color: #b91c1c; }
        .scope { white-space: pre-line; line-height: 1.5; }
        .footer { margin-top: 18px; font-size: 9px; color: #9ca3af; text-align: right; }
    </style>
</head>
<body>
    <h1>{{ $loa->loa_number }}</h1>
    <p class="subtitle">Letter of Award / Purchase Order &mdash; {{ $loa->client }}</p>

    <table class="columns">
        <tr>
            <td>
                <div class="section">
                    <h2>LOA Details</h2>
                    <table class="details">
                        <tr><td class="label">LOA Number</td><td class="value">{{ $loa->loa_number }}</td></tr>
                        <tr><td class="label">Client</td><td class="value">{{ $loa->client }}</td></tr>
                        <tr><td class="label">Division</td><td class="value">{{ $loa->division->name ?? '—' }}</td></tr>
                        <tr><td class="label">Work Type</td><td class="value">{{ $loa->work_type }}</td></tr>
                        <tr><td class="label">Contract Value</td><td class="value">&#8377;{{ number_format((float) $loa->contract_value_amount, 2) }} {{ $loa->contract_value_unit }}</td></tr>
                        <tr><td class="label">Completion Period</td><td class="value">{{ $loa->completion_period_months }} Months</td></tr>
                        <tr><td class="label">Defect Liability</td><td class="value">{{ $loa->defect_liability_months }} Months</td></tr>
                        <tr><td class="label">Start Date</td><td class="value">{{ optional($loa->start_date)->format('d M Y') ?? '—' }}</td></tr>
                        <tr><td class="label">End Date</td><td class="value">{{ optional($loa->end_date)->format('d M Y') ?? '—' }}</td></tr>
                        <tr><td class="label">Total Stations</td><td class="value">{{ $loa->total_stations }} Stations</td></tr>
                        <tr>
                            <td class="label">Status</td>
                            <td class="value">
                                <span class="status {{ $loa->active_status ? 'active' : 'inactive' }}">
                                    {{ $loa->active_status ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td>
                <div class="section">
                    <h2>Financial Security</h2>
                    @php
                        $financialSecurityLabels = [
                            'emd' => 'EMD',
                            'performance_bg' => 'Performance BG',
                            'security_bg' => 'Security BG',
                        ];
                    @endphp
                    <table class="details">
                        @foreach ($financialSecurityLabels as $type => $label)
                            @php $security = $financialSecurities->firstWhere('security_type', $type); @endphp
                            <tr>
                                <td class="label">{{ $label }}</td>
                                <td class="value">
                                    @if ($security)
                                        &#8377;{{ number_format((float) $security->amount, 2) }} {{ $security->amount_unit }}
                                        &mdash; {{ optional($security->validity_start_date)->format('d M Y') ?? '—' }}
                                        to {{ optional($security->validity_end_date)->format('d M Y') ?? '—' }}
                                        &mdash; {{ $security->claim_period }} {{ $security->claim_period_unit }} claim
                                        &mdash; {{ $security->bank->name ?? '—' }}
                                    @else
                                        &#8212;
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                        <tr><td class="label">Mobilization Advance</td><td class="value">&#8377;{{ number_format((float) $loa->mobilization_advance_amount, 2) }} {{ $loa->mobilization_advance_unit }}</td></tr>
                        <tr><td class="label">Mob. Advance Status</td><td class="value">{{ $loa->mobilization_advance_status }}</td></tr>
                    </table>
                </div>

                <div class="section">
                    <h2>Project Team</h2>
                    @if ($loa->teamMembers->isEmpty())
                        <p>No team members added.</p>
                    @else
                        <table class="details">
                            @foreach ($loa->teamMembers as $member)
                                <tr>
                                    <td class="label">{{ $member->role }}</td>
                                    <td class="value">{{ $member->name }}</td>
                                </tr>
                            @endforeach
                        </table>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <div class="section">
        <h2>Scope of Work</h2>
        <p class="scope">{{ $loa->scope_of_work ?: '—' }}</p>
    </div>

    <div class="section">
        <h2>LOA Item Details</h2>
        @if ($loa->scheduleName || $loa->scheduleType)
            <p class="schedule-caption">{{ collect([$loa->scheduleName?->name, $loa->scheduleType?->name])->filter()->implode('-') }}</p>
        @endif
        @if ($items->isEmpty())
            <p>No item details added.</p>
        @else
            @php
                $scheduleGroups = $items->groupBy(fn ($item) => ($item->schedule_name_id ?? 'none').'-'.($item->schedule_type_id ?? 'none'));
            @endphp
            <table class="grid">
                <thead>
                    <tr>
                        <th>Item S.no</th>
                        <th>Item Desc</th>
                        <th>Item Code</th>
                        <th class="num">Item Qty</th>
                        <th>Qty Unit</th>
                        <th class="num">Unit Rate (Rs)</th>
                        <th>Escl. (%)</th>
                        <th class="num">Advt. Value (Rs)</th>
                        <th class="num">Bid Rate/ Unit Rate</th>
                        <th class="num">Bid Amount (Rs)</th>
                        <th class="num">Rebate %</th>
                        <th class="num">Final Bid Amount (Rs)</th>
                        <th>Inspection By</th>
                        <th>Payment Type</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($scheduleGroups as $groupItems)
                        @php
                            $groupFirst = $groupItems->first();
                            $groupLabel = collect([$groupFirst->scheduleName?->name, $groupFirst->scheduleType?->name])->filter()->implode(' - ');
                            $groupLabel = $groupLabel !== '' ? $groupLabel : 'Unassigned Items';
                            $groupAdvertisedValue = $groupItems->sum(fn ($item) => (float) $item->advertised_value);
                            $groupBidAmount = $groupItems->sum(fn ($item) => (float) $item->bid_amount);
                        @endphp
                        <tr class="schedule">
                            <td colspan="7">Schedule {{ $groupLabel }}</td>
                            <td class="num">&#8377;{{ number_format($groupAdvertisedValue, 2) }}</td>
                            <td></td>
                            <td class="num">&#8377;{{ number_format($groupBidAmount, 2) }}</td>
                            <td colspan="4"></td>
                        </tr>
                        @foreach ($groupItems as $index => $item)
                            <tr>
                                <td>{{ $index + 1 }}</td>
                                <td>{{ $item->item_description }}</td>
                                <td>{{ $item->item_code ?? '—' }}</td>
                                <td class="num">{{ number_format((float) $item->item_quantity, 3) }}</td>
                                <td>{{ $item->quantity_unit }}</td>
                                <td class="num">&#8377;{{ number_format((float) $item->unit_rate, 2) }}</td>
                                <td class="num">{{ $item->escalation !== null ? number_format((float) $item->escalation, 2).'%' : '—' }}</td>
                                <td class="num">&#8377;{{ number_format((float) $item->advertised_value, 2) }}</td>
                                <td class="num">
                                    <div>&#8377;{{ number_format((float) $item->bid_rate, 2) }}</div>
                                    @if ($item->bid_rate_unit)
                                        <div style="font-size: 9px; font-weight: bold; color: {{ $item->bid_rate_unit === '% Above' ? '#dc2626' : '#16a34a' }};">
                                            {{ number_format((float) $item->bid_percentage_value, 4) }}{{ $item->bid_rate_unit }}
                                        </div>
                                    @endif
                                </td>
                                <td class="num">&#8377;{{ number_format((float) $item->bid_amount, 2) }}</td>
                                <td class="num">{{ $item->rebate_enabled ? number_format((float) $item->rebate_percentage, 2).'%' : '—' }}</td>
                                <td class="num">&#8377;{{ number_format((float) $item->final_bid_amount, 2) }}</td>
                                <td>{{ $item->inspection_by ?? '—' }}</td>
                                <td>
                                    @php
                                        $stageParts = [];
                                        foreach (\App\Support\PaymentStages::KEYS as $stageKey) {
                                            if (! empty($item->payment_stages[$stageKey])) {
                                                $stageParts[] = $stageKey.' '.$item->payment_stages[$stageKey];
                                            }
                                        }
                                    @endphp
                                    {{ $stageParts !== [] ? implode(', ', $stageParts) : '—' }}
                                </td>
                            </tr>
                        @endforeach
                        <tr class="schedule-total">
                            <td colspan="7">Schedule Totals</td>
                            <td class="num">&#8377;{{ number_format($groupAdvertisedValue, 2) }}</td>
                            <td></td>
                            <td class="num">&#8377;{{ number_format($groupBidAmount, 2) }}</td>
                            <td colspan="4"></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>

    <p class="footer">Generated {{ now()->format('d M Y, h:i A') }}</p>
</body>
</html>
