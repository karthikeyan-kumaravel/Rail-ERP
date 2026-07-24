<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Support\AlertPresenter;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $alerts = Alert::query()
            ->with('alertable')
            ->where('is_delete', false)
            ->orderBy('due_date')
            ->limit(5)
            ->get()
            ->map(fn (Alert $alert) => AlertPresenter::present($alert));

        return Inertia::render('dashboard', [
            'alerts' => $alerts,
        ]);
    }
}
