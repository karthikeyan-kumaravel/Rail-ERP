<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Every list/dropdown-option query in the app filters `->where('is_delete',
 * false)` before sorting on a per-table default column, but `is_delete` was
 * never indexed on any table — this migration closes that gap, plus two
 * `(loa_id, order_no)` composites that `loa_items` already had but its
 * sibling tables didn't.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_types', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'user_types_is_delete_name_index');
        });

        Schema::table('user_screens', function (Blueprint $table) {
            $table->index(['is_delete', 'order_no'], 'user_screens_is_delete_order_no_index');
        });

        Schema::table('states', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'states_is_delete_name_index');
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'districts_is_delete_name_index');
        });

        Schema::table('cities', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'cities_is_delete_name_index');
        });

        Schema::table('zones', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'zones_is_delete_name_index');
        });

        Schema::table('divisions', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'divisions_is_delete_name_index');
        });

        Schema::table('stations', function (Blueprint $table) {
            $table->index(['is_delete', 'station_name'], 'stations_is_delete_station_name_index');
            $table->index(['is_delete', 'station_code'], 'stations_is_delete_station_code_index');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'customers_is_delete_name_index');
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->index(['is_delete', 'company_name'], 'vendors_is_delete_company_name_index');
        });

        Schema::table('loas', function (Blueprint $table) {
            $table->index(['is_delete', 'loa_number'], 'loas_is_delete_loa_number_index');
            $table->index(['is_delete', 'end_date'], 'loas_is_delete_end_date_index');
            $table->index(['is_delete', 'created_at'], 'loas_is_delete_created_at_index');
        });

        Schema::table('loa_team_members', function (Blueprint $table) {
            $table->index(['loa_id', 'order_no'], 'loa_team_members_loa_id_order_no_index');
        });

        Schema::table('loa_stations', function (Blueprint $table) {
            $table->index(['loa_id', 'order_no'], 'loa_stations_loa_id_order_no_index');
        });

        Schema::table('schedule_names', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'schedule_names_is_delete_name_index');
        });

        Schema::table('schedule_types', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'schedule_types_is_delete_name_index');
        });

        Schema::table('activities', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'activities_is_delete_name_index');
        });

        Schema::table('engineer_types', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'engineer_types_is_delete_name_index');
        });

        Schema::table('units', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'units_is_delete_name_index');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'departments_is_delete_name_index');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'projects_is_delete_name_index');
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->index(['is_delete', 'order_date'], 'purchase_orders_is_delete_order_date_index');
            $table->index(['is_delete', 'dispatch_status'], 'purchase_orders_is_delete_dispatch_status_index');
        });

        Schema::table('banks', function (Blueprint $table) {
            $table->index(['is_delete', 'name'], 'banks_is_delete_name_index');
        });

        Schema::table('alerts', function (Blueprint $table) {
            $table->index(['is_delete', 'due_date'], 'alerts_is_delete_due_date_index');
            $table->index(['is_delete', 'severity', 'due_date'], 'alerts_is_delete_severity_due_date_index');
        });

        Schema::table('engineers', function (Blueprint $table) {
            $table->index(['is_delete', 'full_name'], 'engineers_is_delete_full_name_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('name', 'users_name_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_types', function (Blueprint $table) {
            $table->dropIndex('user_types_is_delete_name_index');
        });

        Schema::table('user_screens', function (Blueprint $table) {
            $table->dropIndex('user_screens_is_delete_order_no_index');
        });

        Schema::table('states', function (Blueprint $table) {
            $table->dropIndex('states_is_delete_name_index');
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->dropIndex('districts_is_delete_name_index');
        });

        Schema::table('cities', function (Blueprint $table) {
            $table->dropIndex('cities_is_delete_name_index');
        });

        Schema::table('zones', function (Blueprint $table) {
            $table->dropIndex('zones_is_delete_name_index');
        });

        Schema::table('divisions', function (Blueprint $table) {
            $table->dropIndex('divisions_is_delete_name_index');
        });

        Schema::table('stations', function (Blueprint $table) {
            $table->dropIndex('stations_is_delete_station_name_index');
            $table->dropIndex('stations_is_delete_station_code_index');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('customers_is_delete_name_index');
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropIndex('vendors_is_delete_company_name_index');
        });

        Schema::table('loas', function (Blueprint $table) {
            $table->dropIndex('loas_is_delete_loa_number_index');
            $table->dropIndex('loas_is_delete_end_date_index');
            $table->dropIndex('loas_is_delete_created_at_index');
        });

        Schema::table('loa_team_members', function (Blueprint $table) {
            $table->dropIndex('loa_team_members_loa_id_order_no_index');
        });

        Schema::table('loa_stations', function (Blueprint $table) {
            $table->dropIndex('loa_stations_loa_id_order_no_index');
        });

        Schema::table('schedule_names', function (Blueprint $table) {
            $table->dropIndex('schedule_names_is_delete_name_index');
        });

        Schema::table('schedule_types', function (Blueprint $table) {
            $table->dropIndex('schedule_types_is_delete_name_index');
        });

        Schema::table('activities', function (Blueprint $table) {
            $table->dropIndex('activities_is_delete_name_index');
        });

        Schema::table('engineer_types', function (Blueprint $table) {
            $table->dropIndex('engineer_types_is_delete_name_index');
        });

        Schema::table('units', function (Blueprint $table) {
            $table->dropIndex('units_is_delete_name_index');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->dropIndex('departments_is_delete_name_index');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('projects_is_delete_name_index');
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropIndex('purchase_orders_is_delete_order_date_index');
            $table->dropIndex('purchase_orders_is_delete_dispatch_status_index');
        });

        Schema::table('banks', function (Blueprint $table) {
            $table->dropIndex('banks_is_delete_name_index');
        });

        Schema::table('alerts', function (Blueprint $table) {
            $table->dropIndex('alerts_is_delete_due_date_index');
            $table->dropIndex('alerts_is_delete_severity_due_date_index');
        });

        Schema::table('engineers', function (Blueprint $table) {
            $table->dropIndex('engineers_is_delete_full_name_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_name_index');
        });
    }
};
