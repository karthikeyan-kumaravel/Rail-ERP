<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $loa->loa_number }}</title>
    <style>
        @page { margin: 30px 34px 46px; }

        * { box-sizing: border-box; }

        body { font-family: 'DejaVu Sans', 'Helvetica', 'Arial', sans-serif; font-size: 10px; line-height: 1.45; color: #1c2a37; }

        h1, h2, p { margin: 0; padding: 0; }

        /* Letterhead */
        .letterhead { border-bottom: 3px solid #f2905c; padding-bottom: 10px; margin-bottom: 16px; }
        .letterhead table { width: 100%; border-collapse: collapse; }
        .letterhead td { vertical-align: bottom; }
        .brand-name { font-size: 19px; font-weight: bold; color: #0f2436; letter-spacing: 0.3px; }
        .brand-tagline { font-size: 8.5px; color: #8a94a3; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 2px; }
        .doc-meta { text-align: right; }
        .doc-meta .doc-type { font-size: 8.5px; color: #8a94a3; text-transform: uppercase; letter-spacing: 1.2px; }
        .doc-meta .doc-number { font-size: 15px; font-weight: bold; color: #0f2436; margin-top: 2px; }

        .status-pill { display: inline-block; margin-top: 5px; padding: 3px 10px; border-radius: 9px; font-size: 8.5px; font-weight: bold; letter-spacing: 0.3px; }
        .status-pill.active { background: #e6f6ec; color: #1f8f5c; }
        .status-pill.inactive { background: #fbe4e4; color: #b91c1c; }

        /* Section shell */
        .section { margin-bottom: 14px; }
        .section-title { background: #0f2436; color: #ffffff; font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.6px; padding: 6px 10px; border-radius: 4px 4px 0 0; }
        .section-body { border: 1px solid #e2e7ee; border-top: none; border-radius: 0 0 4px 4px; padding: 10px 12px; }
        .section-body.tight { padding: 0; }
        .section-body.empty { padding: 12px; color: #94a3b8; font-size: 9.5px; }

        table.columns { width: 100%; border-collapse: collapse; }
        table.columns > tr > td { vertical-align: top; width: 50%; }
        table.columns > tr > td:first-child { padding-right: 8px; }
        table.columns > tr > td:last-child { padding-left: 8px; }

        table.info { width: 100%; border-collapse: collapse; }
        table.info tr td { padding: 5px 2px; vertical-align: top; border-bottom: 1px solid #f0f3f7; }
        table.info tr:last-child td { border-bottom: none; }
        table.info td.label { width: 40%; color: #7c8798; font-size: 8px; text-transform: uppercase; letter-spacing: 0.4px; }
        table.info td.value { font-weight: bold; color: #0f2436; font-size: 9.5px; }
        table.info td.value.urgent { color: #8b0000; }
        table.info td.value .value-note { display: block; margin-top: 2px; font-weight: normal; color: #64748b; font-size: 8.5px; }

        .urgent-tag { display: inline-block; margin-left: 5px; padding: 1px 6px; border-radius: 7px; background: #8b0000; color: #ffffff; font-size: 7.5px; font-weight: bold; letter-spacing: 0.3px; }

        .scope-text { font-size: 9.5px; line-height: 1.6; color: #1c2a37; white-space: pre-line; }

        table.grid { width: 100%; border-collapse: collapse; }
        table.grid thead th { background: #0f2436; color: #ffffff; font-size: 8px; text-transform: uppercase; letter-spacing: 0.3px; padding: 6px 5px; text-align: left; }
        table.grid td { padding: 5px; font-size: 8.5px; border-bottom: 1px solid #edf0f4; }
        table.grid td.num { text-align: right; }
        table.grid tbody tr.odd td { background: #f8fafc; }
        tr.schedule-row td { background: #f6ead2; font-weight: bold; color: #7a5b12; border-top: 1px solid #eadfc0; border-bottom: 1px solid #eadfc0; }
        tr.schedule-total-row td { background: #fbf4e2; font-weight: bold; color: #0f2436; border-top: 1px solid #e0a94a; }
        .schedule-caption { margin: 0 0 8px; padding: 7px 10px; background: #f6ead2; border-left: 3px solid #c9a227; font-weight: bold; font-size: 9.5px; color: #6b4e10; }

        tr { page-break-inside: avoid; }

        #footer { position: fixed; left: 0; right: 0; bottom: -32px; text-align: center; font-size: 8px; color: #9aa5b1; border-top: 1px solid #e2e7ee; padding-top: 6px; }
        #footer .page:after { content: counter(page); }
        .generated-note { text-align: right; font-size: 8px; color: #9aa5b1; margin-top: 4px; }
    </style>
</head>
<body>
    <div id="footer">
        Generated {{ now()->format('d M Y, h:i A') }} &middot; Page <span class="page"></span>
    </div>

    <div class="letterhead">
        <table>
            <tr>
                <td>
                    <div class="brand-name">Rail ERP</div>
                    <div class="brand-tagline">Contract Management System</div>
                </td>
                <td class="doc-meta">
                    <div class="doc-type">Letter of Acceptance / Purchase Order</div>
                    <div class="doc-number">{{ $loa->loa_number }}</div>
                    <span class="status-pill {{ $loa->active_status ? 'active' : 'inactive' }}">
                        {{ $loa->active_status ? 'ACTIVE' : 'INACTIVE' }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    @php
        $daysToCompletion = $loa->completion_date
            ? now()->startOfDay()->diffInDays($loa->completion_date, false)
            : null;
        $completionUrgent = $daysToCompletion !== null && $daysToCompletion <= 30;
    @endphp

    <table class="columns">
        <tr>
            <td>
                <div class="section">
                    <div class="section-title">LOA Details</div>
                    <div class="section-body">
                        <table class="info">
                            <tr><td class="label">LOA Number</td><td class="value">{{ $loa->loa_number }}</td></tr>
                            <tr><td class="label">LOA Date</td><td class="value">{{ optional($loa->loa_date)->format('d M Y') ?? '—' }}</td></tr>
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
                                <td class="label">Completion Date</td>
                                <td class="value {{ $completionUrgent ? 'urgent' : '' }}">
                                    {{ optional($loa->completion_date)->format('d M Y') ?? '—' }}
                                    @if ($completionUrgent)
                                        <span class="urgent-tag">{{ $daysToCompletion < 0 ? 'OVERDUE' : 'DUE SOON' }}</span>
                                    @endif
                                </td>
                            </tr>
                            <tr><td class="label">Extension Date</td><td class="value">{{ optional($loa->extension_date)->format('d M Y') ?? '—' }}</td></tr>
                        </table>
                    </div>
                </div>
            </td>
            <td>
                <div class="section">
                    <div class="section-title">Financial Security</div>
                    <div class="section-body">
                        @php
                            $financialSecurityLabels = [
                                'emd' => 'EMD',
                                'performance_bg' => 'Performance BG',
                                'security_bg' => 'Security BG',
                            ];
                        @endphp
                        <table class="info">
                            @foreach ($financialSecurityLabels as $type => $label)
                                @php $security = $financialSecurities->firstWhere('security_type', $type); @endphp
                                <tr>
                                    <td class="label">{{ $label }}</td>
                                    <td class="value">
                                        @if ($security)
                                            &#8377;{{ number_format((float) $security->amount, 2) }} {{ $security->amount_unit }}
                                            <span class="value-note">
                                                {{ optional($security->validity_start_date)->format('d M Y') ?? '—' }}
                                                to {{ optional($security->validity_end_date)->format('d M Y') ?? '—' }}
                                                &middot; {{ $security->claim_period }} {{ $security->claim_period_unit }} claim
                                                &middot; {{ $security->bank->name ?? '—' }}
                                            </span>
                                        @else
                                            &#8212;
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </table>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Project Team</div>
                    @if ($loa->teamMembers->isEmpty())
                        <div class="section-body empty">No team members added.</div>
                    @else
                        <div class="section-body">
                            <table class="info">
                                @foreach ($loa->teamMembers as $member)
                                    <tr><td class="label">{{ $member->role }}</td><td class="value">{{ $member->name }}</td></tr>
                                @endforeach
                            </table>
                        </div>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <div class="section">
        <div class="section-title">Scope of Work</div>
        <div class="section-body">
            <p class="scope-text">{{ $loa->scope_of_work ?: '—' }}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">LOA Item Details</div>
        @if ($items->isEmpty())
            <div class="section-body empty">No item details added.</div>
        @else
            <div class="section-body tight">
                @if ($loa->scheduleName || $loa->scheduleType)
                    <p class="schedule-caption">{{ collect([$loa->scheduleName?->name, $loa->scheduleType?->name])->filter()->implode(' - ') }}</p>
                @endif
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
                            <tr class="schedule-row">
                                <td colspan="7">Schedule {{ $groupLabel }}</td>
                                <td class="num">&#8377;{{ number_format($groupAdvertisedValue, 2) }}</td>
                                <td></td>
                                <td class="num">&#8377;{{ number_format($groupBidAmount, 2) }}</td>
                                <td colspan="4"></td>
                            </tr>
                            @foreach ($groupItems as $index => $item)
                                <tr class="{{ $index % 2 === 1 ? 'odd' : '' }}">
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
                                            <div style="font-size: 8px; font-weight: bold; color: {{ $item->bid_rate_unit === '% Above' ? '#b91c1c' : '#1f8f5c' }};">
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
                            <tr class="schedule-total-row">
                                <td colspan="7">Schedule Totals</td>
                                <td class="num">&#8377;{{ number_format($groupAdvertisedValue, 2) }}</td>
                                <td></td>
                                <td class="num">&#8377;{{ number_format($groupBidAmount, 2) }}</td>
                                <td colspan="4"></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>

    <p class="generated-note">Rail ERP &middot; Contract Management System</p>
</body>
</html>
