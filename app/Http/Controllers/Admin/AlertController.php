<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Support\AlertPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlertController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $severity = $request->string('severity')->toString();
        $perPage = $this->resolvePerPage($request);

        $query = Alert::query()
            ->with('alertable')
            ->where('is_delete', false)
            ->when(
                in_array($severity, [Alert::SEVERITY_CRITICAL, Alert::SEVERITY_WARNING], true),
                fn ($query) => $query->where('severity', $severity),
            )
            ->orderBy('due_date');

        $activeCount = (clone $query)->count();

        $alerts = $this->paginateQuery($query, $perPage);
        $alerts->through(fn (Alert $alert) => AlertPresenter::present($alert));

        return Inertia::render('admin/alerts/index', [
            'alerts' => $alerts,
            'activeCount' => $activeCount,
            'filters' => [
                'severity' => $severity,
                'per_page' => $perPage,
            ],
        ]);
    }
}
