<?php

use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\AlertController;
use App\Http\Controllers\Admin\BankController;
use App\Http\Controllers\Admin\CityController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\DistrictController;
use App\Http\Controllers\Admin\DivisionController;
use App\Http\Controllers\Admin\EngineerController;
use App\Http\Controllers\Admin\EngineerTypeController;
use App\Http\Controllers\Admin\ExecutionPlanController;
use App\Http\Controllers\Admin\Imports\SettingsImportController;
use App\Http\Controllers\Admin\LoaController;
use App\Http\Controllers\Admin\LoaItemImportController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\PurchaseOrderController;
use App\Http\Controllers\Admin\ScheduleNameController;
use App\Http\Controllers\Admin\ScheduleTypeController;
use App\Http\Controllers\Admin\StateController;
use App\Http\Controllers\Admin\StationController;
use App\Http\Controllers\Admin\UnitController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserScreenController;
use App\Http\Controllers\Admin\UserTypeController;
use App\Http\Controllers\Admin\UserTypePermissionController;
use App\Http\Controllers\Admin\VendorController;
use App\Http\Controllers\Admin\ZoneController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\CaptchaController;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\PreventAdminDelete;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('home');
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::get('captcha', [CaptchaController::class, 'image'])->name('captcha');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // Temporary preview route for the login1.tsx redesign — remove once reviewed/approved.
    Route::get('login1-preview', function () {
        $props = [
            'hcaptchaSiteKey' => config('services.hcaptcha.site_key'),
            'logoUrl' => asset('images/indian-railways-logo.svg'),
            'trainBackgroundUrl' => asset('images/login-bg.jpg'),
        ];

        if (! filled(config('services.hcaptcha.site_key')) || ! filled(config('services.hcaptcha.secret_key'))) {
            $props['captchaImageUrl'] = route('captcha');
        }

        return Inertia::render('login1', $props);
    });
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('admin')->name('admin.')->middleware([
        'authorize.admin',
        PreventAdminDelete::class,
    ])->group(function () {
        Route::resource('users', UserController::class)->except('show');
        Route::resource('user-types', UserTypeController::class)->except('show');
        Route::get('user-types/{user_type}', [UserTypeController::class, 'show'])->name('user-types.show');
        Route::resource('user-screens', UserScreenController::class)->except('show');
        Route::get('user-type-permissions', [UserTypePermissionController::class, 'index'])
            ->name('user-type-permissions.index');
        Route::get('user-type-permissions/{user_type}/edit', [UserTypePermissionController::class, 'edit'])
            ->name('user-type-permissions.edit');
        Route::put('user-type-permissions/{user_type}', [UserTypePermissionController::class, 'update'])
            ->name('user-type-permissions.update');
        Route::resource('states', StateController::class)->except('show');
        Route::resource('districts', DistrictController::class)->except('show');
        Route::resource('cities', CityController::class)->except('show');
        Route::resource('zones', ZoneController::class)->except('show');
        Route::resource('divisions', DivisionController::class)->except('show');
        Route::resource('stations', StationController::class)->except('show');
        Route::resource('customers', CustomerController::class)->except('show');
        Route::resource('vendors', VendorController::class)->except('show');
        Route::resource('banks', BankController::class)->except('show');
        Route::post('loas/items/import-preview', LoaItemImportController::class)
            ->name('loas.items.import-preview');
        Route::get('loas/{loa}/pdf', [LoaController::class, 'pdf'])->name('loas.pdf');
        Route::resource('loas', LoaController::class);
        Route::resource('activities', ActivityController::class)->except('show');
        Route::resource('engineer-types', EngineerTypeController::class)->except('show');
        Route::get('engineers/search', [EngineerController::class, 'search'])->name('engineers.search');
        Route::resource('engineers', EngineerController::class)->except('show');
        Route::resource('units', UnitController::class)->except('show');
        Route::resource('departments', DepartmentController::class)->except('show');
        Route::resource('projects', ProjectController::class);
        Route::resource('purchase-orders', PurchaseOrderController::class)
            ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
        Route::get('execution-plan', [ExecutionPlanController::class, 'index'])
            ->name('execution-plan.index');
        Route::resource('schedule-names', ScheduleNameController::class)->except('show');
        Route::resource('schedule-types', ScheduleTypeController::class)->except('show');
        Route::get('alerts', [AlertController::class, 'index'])->name('alerts.index');

        Route::prefix('imports')->name('imports.')->group(function () {
            Route::get('{module}/template', [SettingsImportController::class, 'template'])->name('template');
            Route::post('{module}/preview', [SettingsImportController::class, 'preview'])->name('preview');
            Route::post('{module}/store', [SettingsImportController::class, 'store'])->name('store');
            Route::get('logs/{importLog}/errors', [SettingsImportController::class, 'errors'])->name('errors');
        });
    });
});
