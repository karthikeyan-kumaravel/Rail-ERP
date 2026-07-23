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
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\CaptchaController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('home');
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::get('captcha', [CaptchaController::class, 'image'])->name('captcha');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('alerts', [AlertController::class, 'index'])->name('alerts.index');
        Route::resource('users', UserController::class)->except('show');
        Route::resource('user-types', UserTypeController::class)->except('show');
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
        Route::resource('schedule-names', ScheduleNameController::class)->except('show');
        Route::resource('schedule-types', ScheduleTypeController::class)->except('show');

        Route::prefix('imports')->name('imports.')->group(function () {
            Route::get('{module}/template', [SettingsImportController::class, 'template'])->name('template');
            Route::post('{module}/preview', [SettingsImportController::class, 'preview'])->name('preview');
            Route::post('{module}/store', [SettingsImportController::class, 'store'])->name('store');
            Route::get('logs/{importLog}/errors', [SettingsImportController::class, 'errors'])->name('errors');
        });
    });
});
