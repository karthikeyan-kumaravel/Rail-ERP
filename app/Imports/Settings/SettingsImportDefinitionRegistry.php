<?php

namespace App\Imports\Settings;

use App\Models\Activity;
use App\Models\Bank;
use App\Models\City;
use App\Models\Customer;
use App\Models\Department;
use App\Models\District;
use App\Models\Division;
use App\Models\EngineerType;
use App\Models\Project;
use App\Models\ScheduleName;
use App\Models\ScheduleType;
use App\Models\State;
use App\Models\Station;
use App\Models\Unit;
use App\Models\Vendor;
use App\Models\Zone;
use InvalidArgumentException;

class SettingsImportDefinitionRegistry
{
    /**
     * @return array<string, SettingsImportDefinition>
     */
    public function all(): array
    {
        return [
            'states' => new SettingsImportDefinition(
                module: 'states',
                label: 'State',
                modelClass: State::class,
                sheetTitle: 'States',
                columns: [
                    ['key' => 'state_name', 'heading' => 'State Name *', 'required' => true],
                    ['key' => 'state_code', 'heading' => 'State Code'],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['state_name' => 'Tamil Nadu', 'state_code' => 'TN', 'status' => 'Active'],
                    ['state_name' => 'Kerala', 'state_code' => 'KL', 'status' => 'Active'],
                ],
                instructions: [
                    'State Name is required and must be unique among active states.',
                    'State Code is optional, maximum 10 characters, and must be unique when provided.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                    'Completely empty rows are ignored.',
                ],
            ),
            'districts' => new SettingsImportDefinition(
                module: 'districts',
                label: 'District',
                modelClass: District::class,
                sheetTitle: 'Districts',
                columns: [
                    ['key' => 'state', 'heading' => 'State *', 'required' => true],
                    ['key' => 'district_name', 'heading' => 'District Name *', 'required' => true],
                    ['key' => 'district_code', 'heading' => 'District Code'],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['state' => 'Tamil Nadu', 'district_name' => 'Chennai', 'district_code' => 'CHN', 'status' => 'Active'],
                    ['state' => 'Kerala', 'district_name' => 'Ernakulam', 'district_code' => 'ERN', 'status' => 'Active'],
                ],
                instructions: [
                    'State must already exist in State settings.',
                    'District Name is required and must be unique within the selected state.',
                    'District Code is optional, maximum 10 characters.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                ],
            ),
            'cities' => new SettingsImportDefinition(
                module: 'cities',
                label: 'City',
                modelClass: City::class,
                sheetTitle: 'Cities',
                columns: [
                    ['key' => 'state', 'heading' => 'State *', 'required' => true],
                    ['key' => 'district', 'heading' => 'District *', 'required' => true],
                    ['key' => 'city_name', 'heading' => 'City Name *', 'required' => true],
                    ['key' => 'city_code', 'heading' => 'City Code'],
                    ['key' => 'pincode', 'heading' => 'Pincode *', 'required' => true, 'format' => 'text'],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['state' => 'Tamil Nadu', 'district' => 'Chennai', 'city_name' => 'Chennai', 'city_code' => 'MAA', 'pincode' => '600001', 'status' => 'Active'],
                    ['state' => 'Kerala', 'district' => 'Ernakulam', 'city_name' => 'Kochi', 'city_code' => 'COK', 'pincode' => '682001', 'status' => 'Active'],
                ],
                instructions: [
                    'State must already exist in State settings.',
                    'District must already exist and belong to the selected state.',
                    'City Name and Pincode are required. Pincode must be exactly 6 digits.',
                    'City Name must be unique within the selected district.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                ],
            ),
            'vendors' => new SettingsImportDefinition(
                module: 'vendors',
                label: 'Vendor',
                modelClass: Vendor::class,
                sheetTitle: 'Vendors',
                columns: [
                    ['key' => 'company_name', 'heading' => 'Company Name *', 'required' => true],
                    ['key' => 'name', 'heading' => 'Name *', 'required' => true],
                    ['key' => 'contact_no', 'heading' => 'Contact No *', 'required' => true, 'format' => 'text'],
                    ['key' => 'alternate_contact_no', 'heading' => 'Alternate Contact No', 'format' => 'text'],
                    ['key' => 'email', 'heading' => 'Mail ID'],
                    ['key' => 'gst_no', 'heading' => 'GST No', 'format' => 'text'],
                    ['key' => 'pan_no', 'heading' => 'PAN No *', 'required' => true, 'format' => 'text'],
                    ['key' => 'pincode', 'heading' => 'Pincode *', 'required' => true, 'format' => 'text'],
                    ['key' => 'state', 'heading' => 'State'],
                    ['key' => 'district', 'heading' => 'District'],
                    ['key' => 'zone_name', 'heading' => 'Zone Name'],
                    ['key' => 'bank_name', 'heading' => 'Bank Name *', 'required' => true],
                    ['key' => 'branch_name', 'heading' => 'Branch Name'],
                    ['key' => 'account_no', 'heading' => 'Account No *', 'required' => true, 'format' => 'text'],
                    ['key' => 'ifsc_code', 'heading' => 'IFSC Code *', 'required' => true, 'format' => 'text'],
                    ['key' => 'account_holder_name', 'heading' => 'Account Holder Name *', 'required' => true],
                    ['key' => 'address', 'heading' => 'Address *', 'required' => true],
                    ['key' => 'username', 'heading' => 'User Name'],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    [
                        'company_name' => 'Acme Traders Pvt Ltd',
                        'name' => 'Rajesh Kumar',
                        'contact_no' => '9876543210',
                        'alternate_contact_no' => '9876500000',
                        'email' => 'vendor@example.com',
                        'gst_no' => '33ABCDE1234F1Z5',
                        'pan_no' => 'ABCDE1234F',
                        'pincode' => '600001',
                        'state' => 'Tamil Nadu',
                        'district' => 'Chennai',
                        'zone_name' => 'Chennai',
                        'bank_name' => 'State Bank of India',
                        'branch_name' => 'Anna Salai',
                        'account_no' => '123456789012',
                        'ifsc_code' => 'SBIN0001234',
                        'account_holder_name' => 'Rajesh Kumar',
                        'address' => '12 Main Street, Chennai',
                        'username' => 'acme_traders',
                        'status' => 'Active',
                    ],
                    [
                        'company_name' => 'Kochi Hardware Suppliers',
                        'name' => 'Anil Menon',
                        'contact_no' => '9847012345',
                        'alternate_contact_no' => '',
                        'email' => 'anil@kochihardware.example',
                        'gst_no' => '32ABCDE5678F1Z2',
                        'pan_no' => 'ABCDE5678F',
                        'pincode' => '682001',
                        'state' => 'Kerala',
                        'district' => 'Ernakulam',
                        'zone_name' => 'Kochi',
                        'bank_name' => 'HDFC Bank',
                        'branch_name' => 'MG Road',
                        'account_no' => '987654321098',
                        'ifsc_code' => 'HDFC0001234',
                        'account_holder_name' => 'Anil Menon',
                        'address' => '4 Market Road, Kochi',
                        'username' => '',
                        'status' => 'Active',
                    ],
                ],
                instructions: [
                    'Company Name, Name, Contact No, PAN No, Pincode, Bank Name, Account No, IFSC Code, Account Holder Name, and Address are required.',
                    'State must already exist in State settings. District must already exist and belong to the selected state (both are optional, but if District is given, State must also be given).',
                    'PAN No must be a valid 10-character PAN (e.g. ABCDE1234F). IFSC Code must be a valid 11-character code (e.g. SBIN0001234).',
                    'Pincode must be exactly 6 digits. Contact No accepts digits, spaces, plus, and hyphen.',
                    'User Name must be unique among vendors when provided.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                    'PAN Proof, Bank Proof, and Password/Login cannot be imported via Excel — upload the proof documents and set a password individually for each vendor afterwards using Edit.',
                    'Duplicate vendors (matched by Company Name + Contact No, or PAN No) are skipped.',
                ],
            ),
            'zones' => new SettingsImportDefinition(
                module: 'zones',
                label: 'Zone',
                modelClass: Zone::class,
                sheetTitle: 'Zones',
                columns: [
                    ['key' => 'zone_name', 'heading' => 'Zone Name *', 'required' => true],
                    ['key' => 'zone_code', 'heading' => 'Zone Code'],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['zone_name' => 'Southern Railway', 'zone_code' => 'SR', 'status' => 'Active'],
                    ['zone_name' => 'Central Railway', 'zone_code' => 'CR', 'status' => 'Active'],
                ],
                instructions: [
                    'Zone Name is required and must be unique among active zones.',
                    'Zone Code is optional, maximum 10 characters, and must be unique when provided.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                    'Completely empty rows are ignored.',
                ],
            ),
            'divisions' => new SettingsImportDefinition(
                module: 'divisions',
                label: 'Division',
                modelClass: Division::class,
                sheetTitle: 'Divisions',
                columns: [
                    ['key' => 'railway_zone', 'heading' => 'Railway Zone *', 'required' => true],
                    ['key' => 'division_name', 'heading' => 'Division Name *', 'required' => true],
                    ['key' => 'division_code', 'heading' => 'Division Code'],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['railway_zone' => 'Southern Railway', 'division_name' => 'Chennai', 'division_code' => 'MAS', 'status' => 'Active'],
                    ['railway_zone' => 'Central Railway', 'division_name' => 'Mumbai', 'division_code' => 'BB', 'status' => 'Active'],
                ],
                instructions: [
                    'Railway Zone must already exist in Zone settings.',
                    'Division Name is required and must be unique within the selected railway zone.',
                    'Division Code is optional, maximum 10 characters.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                ],
            ),
            'stations' => new SettingsImportDefinition(
                module: 'stations',
                label: 'Station',
                modelClass: Station::class,
                sheetTitle: 'Stations',
                columns: [
                    ['key' => 'station_code', 'heading' => 'Station Code *', 'required' => true],
                    ['key' => 'station_name', 'heading' => 'Station Name *', 'required' => true],
                    ['key' => 'zone', 'heading' => 'Zone *', 'required' => true],
                    ['key' => 'division', 'heading' => 'Division *', 'required' => true],
                    ['key' => 'state', 'heading' => 'State'],
                    ['key' => 'district', 'heading' => 'District'],
                    ['key' => 'city', 'heading' => 'City'],
                    ['key' => 'address', 'heading' => 'Address'],
                    ['key' => 'latitude', 'heading' => 'Latitude'],
                    ['key' => 'longitude', 'heading' => 'Longitude'],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['station_code' => 'MAS', 'station_name' => 'Chennai Central', 'zone' => 'Southern Railway', 'division' => 'Chennai', 'state' => 'Tamil Nadu', 'district' => 'Chennai', 'city' => 'Chennai', 'address' => 'Station Road, Chennai', 'latitude' => '13.0827', 'longitude' => '80.2707', 'status' => 'Active'],
                    ['station_code' => 'ERS', 'station_name' => 'Ernakulam Junction', 'zone' => 'Southern Railway', 'division' => 'Thiruvananthapuram', 'state' => 'Kerala', 'district' => 'Ernakulam', 'city' => 'Kochi', 'address' => 'South Railway Station Road, Kochi', 'latitude' => '9.9689', 'longitude' => '76.2919', 'status' => 'Active'],
                ],
                instructions: [
                    'Station Code and Station Name are required. Station Code must be unique.',
                    'Zone must already exist and Division must belong to that zone.',
                    'State, District, City, and Address are optional. If provided, State/District/City must already exist and their relationships must be valid.',
                    'Latitude must be between -90 and 90. Longitude must be between -180 and 180.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                ],
            ),
            'customers' => new SettingsImportDefinition(
                module: 'customers',
                label: 'Customer',
                modelClass: Customer::class,
                sheetTitle: 'Customers',
                columns: [
                    ['key' => 'customer_name', 'heading' => 'Customer Name *', 'required' => true],
                    ['key' => 'billing_address', 'heading' => 'Billing Address *', 'required' => true],
                    ['key' => 'pin_code', 'heading' => 'Pin Code *', 'required' => true, 'format' => 'text'],
                    ['key' => 'state', 'heading' => 'State *', 'required' => true],
                    ['key' => 'district', 'heading' => 'District *', 'required' => true],
                    ['key' => 'zone', 'heading' => 'Zone *', 'required' => true],
                    ['key' => 'contact_name', 'heading' => 'Contact Name *', 'required' => true],
                    ['key' => 'contact_number', 'heading' => 'Contact Number *', 'required' => true, 'format' => 'text'],
                    ['key' => 'contact_landline_number', 'heading' => 'Contact Landline Number', 'format' => 'text'],
                    ['key' => 'email', 'heading' => 'Email'],
                    ['key' => 'active_status', 'heading' => 'Active Status *', 'required' => true],
                ],
                sampleRows: [
                    [
                        'customer_name' => 'ABC Infra Pvt Ltd',
                        'billing_address' => 'No. 25, Anna Salai',
                        'pin_code' => '600002',
                        'state' => 'Tamil Nadu',
                        'district' => 'Chennai',
                        'zone' => 'Chennai Zone',
                        'contact_name' => 'Rajesh Kumar',
                        'contact_number' => '9876543210',
                        'contact_landline_number' => '04423456789',
                        'email' => 'contact@abcinfra.com',
                        'active_status' => 'Active',
                    ],
                ],
                instructions: [
                    'Customer Name, Billing Address, Pin Code, State, District, Zone, Contact Name, Contact Number, and Active Status are required.',
                    'State must already exist and District must belong to that state.',
                    'Pin Code must be exactly 6 digits. Contact Number accepts digits, spaces, plus, and hyphen.',
                    'Email must be valid and unique when provided.',
                    'Duplicate customers are skipped based on Customer Name + Contact Number.',
                    'Active Status accepts Active or Inactive.',
                ],
            ),
            'activities' => new SettingsImportDefinition(
                module: 'activities',
                label: 'Activity',
                modelClass: Activity::class,
                sheetTitle: 'Activities',
                columns: [
                    ['key' => 'activity_name', 'heading' => 'Activity Name *', 'required' => true],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['activity_name' => 'Survey', 'status' => 'Active'],
                    ['activity_name' => 'Drawing', 'status' => 'Active'],
                ],
                instructions: [
                    'Activity Name is required and must be unique among active activities.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                    'Completely empty rows are ignored.',
                ],
            ),
            'engineer-types' => new SettingsImportDefinition(
                module: 'engineer-types',
                label: 'Engineer Type',
                modelClass: EngineerType::class,
                sheetTitle: 'Engineer Types',
                columns: [
                    ['key' => 'engineer_type_name', 'heading' => 'Engineer Type Name *', 'required' => true],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['engineer_type_name' => 'Electrical', 'status' => 'Active'],
                    ['engineer_type_name' => 'Civil', 'status' => 'Active'],
                ],
                instructions: [
                    'Engineer Type Name is required and must be unique among active engineer types.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                    'Completely empty rows are ignored.',
                ],
            ),
            'units' => new SettingsImportDefinition(
                module: 'units',
                label: 'Unit',
                modelClass: Unit::class,
                sheetTitle: 'Units',
                columns: [
                    ['key' => 'unit_name', 'heading' => 'Unit Name *', 'required' => true],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['unit_name' => 'Nos', 'status' => 'Active'],
                    ['unit_name' => 'Meter', 'status' => 'Active'],
                ],
                instructions: [
                    'Unit Name is required and must be unique among active units.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                    'Completely empty rows are ignored.',
                ],
            ),
            'departments' => new SettingsImportDefinition(
                module: 'departments',
                label: 'Department',
                modelClass: Department::class,
                sheetTitle: 'Departments',
                columns: [
                    ['key' => 'department_name', 'heading' => 'Department Name *', 'required' => true],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['department_name' => 'HR', 'status' => 'Active'],
                    ['department_name' => 'Purchase', 'status' => 'Active'],
                ],
                instructions: [
                    'Department Name is required and must be unique among active departments.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                    'Completely empty rows are ignored.',
                ],
            ),
            'schedule-names' => new SettingsImportDefinition(
                module: 'schedule-names',
                label: 'Schedule Name',
                modelClass: ScheduleName::class,
                sheetTitle: 'Schedule Names',
                columns: [
                    ['key' => 'name', 'heading' => 'Name *', 'required' => true],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['name' => 'Mobilization Schedule', 'status' => 'Active'],
                    ['name' => 'Completion Schedule', 'status' => 'Active'],
                ],
                instructions: [
                    'Name is required and must be unique among active schedule names.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                    'Completely empty rows are ignored.',
                ],
            ),
            'schedule-types' => new SettingsImportDefinition(
                module: 'schedule-types',
                label: 'Schedule Type',
                modelClass: ScheduleType::class,
                sheetTitle: 'Schedule Types',
                columns: [
                    ['key' => 'schedule_name', 'heading' => 'Schedule Name *', 'required' => true],
                    ['key' => 'schedule_type_name', 'heading' => 'Schedule Type Name *', 'required' => true],
                    ['key' => 'schedule_type_short_name', 'heading' => 'Schedule Type Short Name *', 'required' => true],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['schedule_name' => 'Mobilization Schedule', 'schedule_type_name' => 'Weekly Progress', 'schedule_type_short_name' => 'WKLY', 'status' => 'Active'],
                    ['schedule_name' => 'Completion Schedule', 'schedule_type_name' => 'Final Handover', 'schedule_type_short_name' => 'FIN', 'status' => 'Active'],
                ],
                instructions: [
                    'Schedule Name must already exist in Schedule Name settings.',
                    'Schedule Type Name is required and must be unique within the selected schedule name.',
                    'Schedule Type Short Name is required, maximum 20 characters.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                ],
            ),
            'projects' => new SettingsImportDefinition(
                module: 'projects',
                label: 'Project',
                modelClass: Project::class,
                sheetTitle: 'Projects',
                columns: [
                    ['key' => 'project_name', 'heading' => 'Project Name *', 'required' => true],
                    ['key' => 'client', 'heading' => 'Client *', 'required' => true],
                    ['key' => 'zone', 'heading' => 'Zone *', 'required' => true],
                    ['key' => 'division', 'heading' => 'Division *', 'required' => true],
                    ['key' => 'loa_number', 'heading' => 'LOA Number *', 'required' => true],
                    ['key' => 'contract_value', 'heading' => 'Contract Value *', 'required' => true],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    ['project_name' => 'Chennai CCTV Upgrade', 'client' => 'ABC Infra Pvt Ltd', 'zone' => 'Southern Railway', 'division' => 'Chennai', 'loa_number' => 'LOA/2026/001', 'contract_value' => '2500000', 'status' => 'Active'],
                ],
                instructions: [
                    'Project Name is required and must be unique among active projects.',
                    'Client must already exist in Customer settings.',
                    'Zone must already exist and Division must belong to that zone.',
                    'LOA Number must already exist in LOA settings.',
                    'Contract Value is required and must be a positive number.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                ],
            ),
            'banks' => new SettingsImportDefinition(
                module: 'banks',
                label: 'Bank',
                modelClass: Bank::class,
                sheetTitle: 'Banks',
                columns: [
                    ['key' => 'name', 'heading' => 'Bank Name *', 'required' => true],
                    ['key' => 'branch_name', 'heading' => 'Branch Name *', 'required' => true],
                    ['key' => 'ifsc_code', 'heading' => 'IFSC Code *', 'required' => true, 'format' => 'text'],
                    ['key' => 'account_number', 'heading' => 'Account Number *', 'required' => true, 'format' => 'text'],
                    ['key' => 'account_holder_name', 'heading' => 'Account Holder Name *', 'required' => true],
                    ['key' => 'account_type', 'heading' => 'Account Type *', 'required' => true],
                    ['key' => 'bank_address', 'heading' => 'Bank Address *', 'required' => true],
                    ['key' => 'pincode', 'heading' => 'Pincode *', 'required' => true, 'format' => 'text'],
                    ['key' => 'contact_number', 'heading' => 'Contact Number *', 'required' => true, 'format' => 'text'],
                    ['key' => 'email', 'heading' => 'Email'],
                    ['key' => 'status', 'heading' => 'Status'],
                ],
                sampleRows: [
                    [
                        'name' => 'Canara Bank',
                        'branch_name' => 'Marine Drive',
                        'ifsc_code' => 'CNRB0001234',
                        'account_number' => '200300400500',
                        'account_holder_name' => 'Suresh Nair',
                        'account_type' => 'Savings',
                        'bank_address' => '22 Beach Road, Kochi - 682011',
                        'pincode' => '682011',
                        'contact_number' => '9845012345',
                        'email' => 'canarabank@example.com',
                        'status' => 'Active',
                    ],
                    [
                        'name' => 'ICICI Bank',
                        'branch_name' => 'Nungambakkam',
                        'ifsc_code' => 'ICIC0005678',
                        'account_number' => '600700800900',
                        'account_holder_name' => 'Priya Raman',
                        'account_type' => 'Current',
                        'bank_address' => '45 Nungambakkam High Road, Chennai - 600034',
                        'pincode' => '600034',
                        'contact_number' => '9840098765',
                        'email' => '',
                        'status' => 'Active',
                    ],
                ],
                instructions: [
                    'Bank Name, Branch Name, IFSC Code, Account Number, Account Holder Name, Account Type, Bank Address, Pincode, and Contact Number are required.',
                    'IFSC Code must be a valid 11-character code (e.g. SBIN0001234). Account Number must be between 9 and 18 characters and unique.',
                    'Account Type accepts Savings or Current. Pincode must be exactly 6 digits. Contact Number must be exactly 10 digits.',
                    'Status accepts Active or Inactive. Blank status defaults to Active.',
                ],
            ),
        ];
    }

    public function get(string $module): SettingsImportDefinition
    {
        $definitions = $this->all();

        if (! isset($definitions[$module])) {
            throw new InvalidArgumentException('Unsupported import module.');
        }

        return $definitions[$module];
    }

    /**
     * @return array<int, string>
     */
    public function modules(): array
    {
        return array_keys($this->all());
    }
}
