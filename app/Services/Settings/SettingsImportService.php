<?php

namespace App\Services\Settings;

use App\Imports\Settings\RawSettingsRowsImport;
use App\Imports\Settings\SettingsImportDefinition;
use App\Imports\Settings\SettingsImportDefinitionRegistry;
use App\Models\Activity;
use App\Models\Bank;
use App\Models\City;
use App\Models\Customer;
use App\Models\Department;
use App\Models\District;
use App\Models\Division;
use App\Models\EngineerType;
use App\Models\ImportLog;
use App\Models\Loa;
use App\Models\Project;
use App\Models\ScheduleName;
use App\Models\ScheduleType;
use App\Models\State;
use App\Models\Station;
use App\Models\Unit;
use App\Models\Zone;
use App\Repositories\Settings\SettingsImportRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class SettingsImportService
{
    private const BASE_DIRECTORY = 'settings-imports';

    public function __construct(
        private readonly SettingsImportDefinitionRegistry $definitions,
        private readonly SettingsImportRepository $repository,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function preview(string $module, UploadedFile $file, ?int $userId): array
    {
        $definition = $this->definitions->get($module);
        $token = (string) Str::uuid();
        $extension = strtolower((string) $file->getClientOriginalExtension());
        $directory = self::BASE_DIRECTORY.'/'.$module;
        $path = "{$directory}/{$token}.{$extension}";
        $metaPath = "{$directory}/{$token}.json";

        Storage::disk('local')->putFileAs($directory, $file, "{$token}.{$extension}");
        Storage::disk('local')->put($metaPath, json_encode([
            'module' => $module,
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'uploaded_by' => $userId,
            'uploaded_at' => now()->toISOString(),
        ], JSON_THROW_ON_ERROR));

        try {
            return [
                ...$this->analyseStoredFile($definition, $path),
                'token' => $token,
                'file_name' => $file->getClientOriginalName(),
                'template_url' => route('admin.imports.template', ['module' => $module]),
            ];
        } catch (Throwable $throwable) {
            $this->deleteStoredFile($module, $token, $path);

            throw $throwable;
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function commit(string $module, string $token, ?int $userId): array
    {
        $definition = $this->definitions->get($module);
        $meta = $this->readMeta($module, $token);
        $analysis = $this->analyseStoredFile($definition, $meta['path']);

        $log = ImportLog::query()->create([
            'module' => $module,
            'file_name' => $meta['original_name'] ?? null,
            'status' => 'processing',
            'total_records' => $analysis['summary']['total_records'],
            'success_count' => 0,
            'failed_count' => $analysis['summary']['failed_records'],
            'duplicate_count' => $analysis['summary']['duplicate_records'],
            'imported_by' => $userId,
            'summary' => $analysis['summary'],
            'errors' => $analysis['error_rows'],
        ]);

        try {
            DB::beginTransaction();

            foreach (array_chunk($analysis['valid_rows'], 500) as $chunk) {
                foreach ($chunk as $row) {
                    $this->repository->create($definition->modelClass, $row['attributes']);
                }
            }

            DB::commit();
        } catch (Throwable $throwable) {
            DB::rollBack();

            $log->update([
                'status' => 'failed',
                'success_count' => 0,
                'summary' => [
                    ...$analysis['summary'],
                    'critical_error' => $throwable->getMessage(),
                ],
                'errors' => [
                    ...$analysis['error_rows'],
                    [
                        'row_number' => null,
                        'status' => 'critical_error',
                        'errors' => [$throwable->getMessage()],
                        'values' => [],
                    ],
                ],
                'completed_at' => now(),
            ]);

            throw $throwable;
        }

        $successCount = count($analysis['valid_rows']);
        $summary = [
            ...$analysis['summary'],
            'successfully_imported' => $successCount,
        ];

        $log->update([
            'status' => 'completed',
            'success_count' => $successCount,
            'summary' => $summary,
            'completed_at' => now(),
        ]);

        $this->deleteStoredFile($module, $token, $meta['path']);

        return [
            'message' => $successCount > 0
                ? "{$definition->label} import completed successfully."
                : "{$definition->label} import completed with no new records.",
            'summary' => [
                ...$summary,
                'failed_records' => $analysis['summary']['failed_records'],
                'duplicate_records' => $analysis['summary']['duplicate_records'],
            ],
            'validation_errors' => $analysis['error_rows'],
            'error_report_url' => count($analysis['error_rows']) > 0
                ? route('admin.imports.errors', ['importLog' => $log->getRouteKey()])
                : null,
            'log_id' => $log->id,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function analyseStoredFile(SettingsImportDefinition $definition, string $path): array
    {
        $absolutePath = Storage::disk('local')->path($path);
        $rawRows = $this->readRows($absolutePath);
        [$headerRowNumber, $headerRow] = $this->extractHeaderRow($rawRows);
        $columnMap = $this->columnMap($definition, $headerRow);
        $missingColumns = $this->missingRequiredColumns($definition, $columnMap);

        if ($missingColumns !== []) {
            throw ValidationException::withMessages([
                'file' => 'Missing required columns: '.implode(', ', $missingColumns),
            ]);
        }

        $rows = [];
        $validRows = [];
        $errorRows = [];
        $seen = [];
        $totalRecords = 0;
        $failedRecords = 0;
        $duplicateRecords = 0;

        foreach ($rawRows as $rowIndex => $rawRow) {
            $rowNumber = $rowIndex + 1;

            if ($rowNumber <= $headerRowNumber || $this->isEmptyRawRow($rawRow)) {
                continue;
            }

            $values = $this->valuesFromRawRow($definition, $rawRow, $columnMap);

            if ($this->isEmptyValuesRow($values)) {
                continue;
            }

            $totalRecords++;
            $validation = $this->validateRow($definition, $values, $seen);
            $status = $validation['status'];
            $previewRow = [
                'row_number' => $rowNumber,
                'status' => $status,
                'values' => $values,
                'errors' => $validation['errors'],
            ];

            $rows[] = $previewRow;

            if ($status === 'valid') {
                $validRows[] = [
                    'row_number' => $rowNumber,
                    'values' => $values,
                    'attributes' => $validation['attributes'],
                ];
            } elseif ($status === 'duplicate') {
                $duplicateRecords++;
                $errorRows[] = $previewRow;
            } else {
                $failedRecords++;
                $errorRows[] = $previewRow;
            }
        }

        return [
            'module' => $definition->module,
            'module_label' => $definition->label,
            'columns' => $definition->columns,
            'rows' => $rows,
            'valid_rows' => $validRows,
            'error_rows' => $errorRows,
            'summary' => [
                'total_records' => $totalRecords,
                'successfully_imported' => 0,
                'failed_records' => $failedRecords,
                'duplicate_records' => $duplicateRecords,
                'preview_valid_records' => count($validRows),
            ],
        ];
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    private function readRows(string $absolutePath): array
    {
        $import = new RawSettingsRowsImport;
        Excel::import($import, $absolutePath);

        return $import->rows();
    }

    /**
     * @param  array<int, array<int, mixed>>  $rows
     * @return array{int, array<int, mixed>}
     */
    private function extractHeaderRow(array $rows): array
    {
        foreach ($rows as $index => $row) {
            if (! $this->isEmptyRawRow($row)) {
                return [$index + 1, $row];
            }
        }

        throw ValidationException::withMessages([
            'file' => 'The uploaded Excel file does not contain any data.',
        ]);
    }

    /**
     * @param  array<int, mixed>  $headerRow
     * @return array<int, string>
     */
    private function columnMap(SettingsImportDefinition $definition, array $headerRow): array
    {
        $expectedHeadings = $definition->headingMap();
        $columnMap = [];

        foreach ($headerRow as $index => $heading) {
            $normalized = $definition->normalizeHeading($this->cellValue($heading));
            $columnMap[$index] = $expectedHeadings[$normalized] ?? $normalized;
        }

        return $columnMap;
    }

    /**
     * @param  array<int, string>  $columnMap
     * @return array<int, string>
     */
    private function missingRequiredColumns(SettingsImportDefinition $definition, array $columnMap): array
    {
        $availableKeys = array_values($columnMap);
        $missing = [];

        foreach ($definition->columns as $column) {
            if (($column['required'] ?? false) === true && ! in_array($column['key'], $availableKeys, true)) {
                $missing[] = $column['heading'];
            }
        }

        return $missing;
    }

    /**
     * @param  array<int, mixed>  $rawRow
     * @param  array<int, string>  $columnMap
     * @return array<string, string>
     */
    private function valuesFromRawRow(SettingsImportDefinition $definition, array $rawRow, array $columnMap): array
    {
        $values = array_fill_keys($definition->keys(), '');

        foreach ($rawRow as $index => $value) {
            $key = $columnMap[$index] ?? null;

            if ($key !== null && array_key_exists($key, $values)) {
                $values[$key] = $this->cellValue($value);
            }
        }

        return $values;
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateRow(SettingsImportDefinition $definition, array $values, array &$seen): array
    {
        return match ($definition->module) {
            'states' => $this->validateState($values, $seen),
            'districts' => $this->validateDistrict($values, $seen),
            'cities' => $this->validateCity($values, $seen),
            'zones' => $this->validateZone($values, $seen),
            'divisions' => $this->validateDivision($values, $seen),
            'stations' => $this->validateStation($values, $seen),
            'customers' => $this->validateCustomer($values, $seen),
            'vendors' => $this->validateVendor($values, $seen),
            'activities' => $this->validateActivity($values, $seen),
            'engineer-types' => $this->validateEngineerType($values, $seen),
            'units' => $this->validateUnit($values, $seen),
            'departments' => $this->validateDepartment($values, $seen),
            'schedule-names' => $this->validateScheduleName($values, $seen),
            'schedule-types' => $this->validateScheduleType($values, $seen),
            'projects' => $this->validateProject($values, $seen),
            'banks' => $this->validateBank($values, $seen),
            default => ['status' => 'invalid', 'errors' => ['Unsupported import module.'], 'attributes' => []],
        };
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateState(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['state_name'], 'State Name', $errors, 255);
        $code = $this->optionalText($values['state_code'], 'State Code', $errors, 10);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($name !== null) {
            $duplicate = $this->markDuplicate($seen, 'states:name:'.$this->key($name))
                || $this->repository->exists(State::class, ['name' => $name]);
        }

        if ($code !== null) {
            $duplicate = $this->markDuplicate($seen, 'states:code:'.$this->key($code))
                || $this->repository->exists(State::class, ['code' => $code])
                || $duplicate;
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'code' => $code,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateDistrict(array $values, array &$seen): array
    {
        $errors = [];
        $state = $this->resolveState($values['state'], $errors);
        $name = $this->requireText($values['district_name'], 'District Name', $errors, 255);
        $code = $this->optionalText($values['district_code'], 'District Code', $errors, 10);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($state !== null && $name !== null) {
            $duplicateKey = 'districts:'.$state->id.':'.$this->key($name);
            $duplicate = $this->markDuplicate($seen, $duplicateKey)
                || $this->repository->exists(District::class, ['state_id' => $state->id, 'name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'state_id' => $state?->id,
            'name' => $name,
            'code' => $code,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateCity(array $values, array &$seen): array
    {
        $errors = [];
        $state = $this->resolveState($values['state'], $errors);
        $district = $this->resolveDistrict($values['district'], $state, $errors);
        $name = $this->requireText($values['city_name'], 'City Name', $errors, 255);
        $cityCode = $this->optionalText($values['city_code'], 'City Code', $errors, 10);
        $pincode = $this->requireText($values['pincode'], 'Pincode', $errors, 6);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($pincode !== null && ! preg_match('/^[0-9]{6}$/', $pincode)) {
            $errors[] = 'Pincode must be exactly 6 digits.';
        }

        if ($district !== null && $name !== null) {
            $duplicateKey = 'cities:'.$district->id.':'.$this->key($name);
            $duplicate = $this->markDuplicate($seen, $duplicateKey)
                || $this->repository->exists(City::class, ['district_id' => $district->id, 'name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'state_id' => $state?->id,
            'district_id' => $district?->id,
            'name' => $name,
            'city_code' => $cityCode,
            'pincode' => $pincode,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateZone(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['zone_name'], 'Zone Name', $errors, 255);
        $code = $this->optionalText($values['zone_code'], 'Zone Code', $errors, 10);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($name !== null) {
            $duplicate = $this->markDuplicate($seen, 'zones:name:'.$this->key($name))
                || $this->repository->exists(Zone::class, ['name' => $name]);
        }

        if ($code !== null) {
            $duplicate = $this->markDuplicate($seen, 'zones:code:'.$this->key($code))
                || $this->repository->exists(Zone::class, ['code' => $code])
                || $duplicate;
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'code' => $code,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateDivision(array $values, array &$seen): array
    {
        $errors = [];
        $zone = $this->resolveZone($values['railway_zone'], $errors);
        $name = $this->requireText($values['division_name'], 'Division Name', $errors, 255);
        $code = $this->optionalText($values['division_code'], 'Division Code', $errors, 10);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($zone !== null && $name !== null) {
            $duplicateKey = 'divisions:'.$zone->id.':'.$this->key($name);
            $duplicate = $this->markDuplicate($seen, $duplicateKey)
                || $this->repository->exists(Division::class, ['zone_id' => $zone->id, 'name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'zone_id' => $zone?->id,
            'name' => $name,
            'code' => $code,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateStation(array $values, array &$seen): array
    {
        $errors = [];
        $stationCode = $this->requireText($values['station_code'], 'Station Code', $errors, 20);
        $stationName = $this->requireText($values['station_name'], 'Station Name', $errors, 255);
        $zone = $this->resolveZone($values['zone'], $errors);
        $division = $this->resolveDivision($values['division'], $zone, $errors);
        [$state, $district, $city] = $this->resolveOptionalStateDistrictAndCity(
            $values['state'],
            $values['district'],
            $values['city'],
            $errors,
        );
        $address = $this->optionalText($values['address'], 'Address', $errors);
        $latitude = $this->optionalNumber($values['latitude'], 'Latitude', $errors, -90, 90);
        $longitude = $this->optionalNumber($values['longitude'], 'Longitude', $errors, -180, 180);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($stationCode !== null) {
            $duplicate = $this->markDuplicate($seen, 'stations:code:'.$this->key($stationCode))
                || $this->repository->exists(Station::class, ['station_code' => $stationCode]);
        }

        return $this->rowResult($errors, $duplicate, [
            'zone_id' => $zone?->id,
            'division_id' => $division?->id,
            'state_id' => $state?->id,
            'district_id' => $district?->id,
            'city_id' => $city?->id,
            'station_code' => $stationCode,
            'station_name' => $stationName,
            'address' => $address,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateCustomer(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['customer_name'], 'Customer Name', $errors, 255);
        $billingAddress = $this->requireText($values['billing_address'], 'Billing Address', $errors);
        $pinCode = $this->requireText($values['pin_code'], 'Pin Code', $errors, 10);
        $state = $this->resolveState($values['state'], $errors);
        $district = $this->resolveDistrict($values['district'], $state, $errors);
        $zone = $this->requireText($values['zone'], 'Zone', $errors, 255);
        $contactName = $this->requireText($values['contact_name'], 'Contact Name', $errors, 255);
        $contactNumber = $this->requireText($values['contact_number'], 'Contact Number', $errors, 20);
        $landline = $this->optionalText($values['contact_landline_number'], 'Contact Landline Number', $errors, 20);
        $email = $this->optionalText($values['email'], 'Email', $errors, 255);
        $status = $this->parseStatus($values['active_status'], true, $errors);
        $duplicate = false;

        if ($pinCode !== null && ! preg_match('/^[0-9]{6}$/', $pinCode)) {
            $errors[] = 'Pin Code must be exactly 6 digits.';
        }

        if ($contactNumber !== null && ! preg_match('/^[0-9+\-\s]{7,20}$/', $contactNumber)) {
            $errors[] = 'Contact Number must be valid.';
        }

        if ($email !== null && ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Email must be a valid email address.';
        }

        if ($email !== null && $this->repository->customerEmailExists($email)) {
            $duplicate = true;
        }

        if ($name !== null && $contactNumber !== null) {
            $duplicateKey = 'customers:'.$this->key($name).':'.$this->key($contactNumber);
            $duplicate = $this->markDuplicate($seen, $duplicateKey)
                || $this->repository->customerDuplicateExists($name, $contactNumber)
                || $duplicate;
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'billing_address' => $billingAddress,
            'pin_code' => $pinCode,
            'state_id' => $state?->id,
            'district_id' => $district?->id,
            'zone' => $zone,
            'contact_name' => $contactName,
            'contact_number' => $contactNumber,
            'contact_landline_number' => $landline,
            'email' => $email,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateVendor(array $values, array &$seen): array
    {
        $errors = [];
        $companyName = $this->requireText($values['company_name'], 'Company Name', $errors, 255);
        $name = $this->requireText($values['name'], 'Name', $errors, 255);
        $contactNo = $this->requireText($values['contact_no'], 'Contact No', $errors, 20);
        $alternateContactNo = $this->optionalText($values['alternate_contact_no'], 'Alternate Contact No', $errors, 20);
        $email = $this->optionalText($values['email'], 'Mail ID', $errors, 255);
        $gstNo = $this->optionalText($values['gst_no'], 'GST No', $errors, 20);
        $gstNo = $gstNo !== null ? strtoupper($gstNo) : null;
        $panNo = $this->requireText($values['pan_no'], 'PAN No', $errors, 10);
        $panNo = $panNo !== null ? strtoupper($panNo) : null;
        $pincode = $this->requireText($values['pincode'], 'Pincode', $errors, 10);
        $zoneName = $this->optionalText($values['zone_name'], 'Zone Name', $errors, 255);
        $bankName = $this->requireText($values['bank_name'], 'Bank Name', $errors, 255);
        $branchName = $this->optionalText($values['branch_name'], 'Branch Name', $errors, 255);
        $accountNo = $this->requireText($values['account_no'], 'Account No', $errors, 30);
        $ifscCode = $this->requireText($values['ifsc_code'], 'IFSC Code', $errors, 15);
        $ifscCode = $ifscCode !== null ? strtoupper($ifscCode) : null;
        $accountHolderName = $this->requireText($values['account_holder_name'], 'Account Holder Name', $errors, 255);
        $address = $this->requireText($values['address'], 'Address', $errors);
        $username = $this->optionalText($values['username'], 'User Name', $errors, 255);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        [$state, $district] = $this->resolveOptionalStateAndDistrict($values['state'], $values['district'], $errors);

        if ($contactNo !== null && ! preg_match('/^[0-9+\-\s]{7,20}$/', $contactNo)) {
            $errors[] = 'Contact No must be valid.';
        }

        if ($alternateContactNo !== null && ! preg_match('/^[0-9+\-\s]{7,20}$/', $alternateContactNo)) {
            $errors[] = 'Alternate Contact No must be valid.';
        }

        if ($email !== null && ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Mail ID must be a valid email address.';
        }

        if ($gstNo !== null && ! preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/', $gstNo)) {
            $errors[] = 'GST No must be a valid 15-character GST number.';
        }

        if ($panNo !== null && ! preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]$/', $panNo)) {
            $errors[] = 'PAN No must be a valid PAN number (e.g. ABCDE1234F).';
        }

        if ($pincode !== null && ! preg_match('/^[0-9]{6}$/', $pincode)) {
            $errors[] = 'Pincode must be exactly 6 digits.';
        }

        if ($ifscCode !== null && ! preg_match('/^[A-Z]{4}0[A-Z0-9]{6}$/', $ifscCode)) {
            $errors[] = 'IFSC Code must be a valid IFSC code (e.g. SBIN0001234).';
        }

        if ($panNo !== null) {
            $duplicate = $this->markDuplicate($seen, 'vendors:pan:'.$this->key($panNo))
                || $this->repository->vendorPanExists($panNo);
        }

        if ($companyName !== null && $contactNo !== null) {
            $duplicateKey = 'vendors:company-contact:'.$this->key($companyName).':'.$this->key($contactNo);
            $duplicate = $this->markDuplicate($seen, $duplicateKey)
                || $this->repository->vendorDuplicateExists($companyName, $contactNo)
                || $duplicate;
        }

        if ($username !== null) {
            $duplicate = $this->markDuplicate($seen, 'vendors:username:'.$this->key($username))
                || $this->repository->vendorUsernameExists($username)
                || $duplicate;
        }

        return $this->rowResult($errors, $duplicate, [
            'company_name' => $companyName,
            'name' => $name,
            'contact_no' => $contactNo,
            'alternate_contact_no' => $alternateContactNo,
            'email' => $email,
            'gst_no' => $gstNo,
            'pan_no' => $panNo,
            'pincode' => $pincode,
            'state_id' => $state?->id,
            'district_id' => $district?->id,
            'zone_name' => $zoneName,
            'bank_name' => $bankName,
            'branch_name' => $branchName,
            'account_no' => $accountNo,
            'ifsc_code' => $ifscCode,
            'account_holder_name' => $accountHolderName,
            'address' => $address,
            'username' => $username,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateBank(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['name'], 'Bank Name', $errors, 100);
        $branchName = $this->requireText($values['branch_name'], 'Branch Name', $errors, 100);
        $ifscCode = $this->requireText($values['ifsc_code'], 'IFSC Code', $errors, 11);
        $ifscCode = $ifscCode !== null ? strtoupper($ifscCode) : null;
        $accountNumber = $this->requireText($values['account_number'], 'Account Number', $errors, 18);
        $accountHolderName = $this->requireText($values['account_holder_name'], 'Account Holder Name', $errors, 100);
        $accountType = $this->requireText($values['account_type'], 'Account Type', $errors);
        $bankAddress = $this->requireText($values['bank_address'], 'Bank Address', $errors);
        $pincode = $this->requireText($values['pincode'], 'Pincode', $errors, 6);
        $contactNumber = $this->requireText($values['contact_number'], 'Contact Number', $errors, 10);
        $email = $this->optionalText($values['email'], 'Email', $errors, 100);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($ifscCode !== null && ! preg_match('/^[A-Z]{4}0[A-Z0-9]{6}$/', $ifscCode)) {
            $errors[] = 'IFSC Code must be a valid IFSC code (e.g. SBIN0001234).';
        }

        if ($accountNumber !== null && (mb_strlen($accountNumber) < 9 || mb_strlen($accountNumber) > 18)) {
            $errors[] = 'Account Number must be between 9 and 18 characters.';
        }

        if ($accountType !== null && ! in_array($accountType, ['Savings', 'Current'], true)) {
            $errors[] = 'Account Type must be Savings or Current.';
        }

        if ($pincode !== null && ! preg_match('/^[0-9]{6}$/', $pincode)) {
            $errors[] = 'Pincode must be exactly 6 digits.';
        }

        if ($contactNumber !== null && ! preg_match('/^[0-9]{10}$/', $contactNumber)) {
            $errors[] = 'Contact Number must be exactly 10 digits.';
        }

        if ($email !== null && ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Email must be a valid email address.';
        }

        if ($accountNumber !== null) {
            $duplicate = $this->markDuplicate($seen, 'banks:account:'.$this->key($accountNumber))
                || $this->repository->exists(Bank::class, ['account_number' => $accountNumber]);
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'branch_name' => $branchName,
            'ifsc_code' => $ifscCode,
            'account_number' => $accountNumber,
            'account_holder_name' => $accountHolderName,
            'account_type' => $accountType,
            'bank_address' => $bankAddress,
            'pincode' => $pincode,
            'contact_number' => $contactNumber,
            'email' => $email,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<int, string>  $errors
     * @return array{0: ?State, 1: ?District}
     */
    private function resolveOptionalStateAndDistrict(string $stateValue, string $districtValue, array &$errors): array
    {
        $stateName = trim($stateValue);
        $districtName = trim($districtValue);
        $state = null;
        $district = null;

        if ($stateName !== '') {
            $state = $this->repository->findState($stateName);

            if ($state === null) {
                $errors[] = "State '{$stateName}' does not exist.";
            }
        }

        if ($districtName !== '') {
            if ($state === null) {
                $errors[] = 'State is required when District is provided.';
            } else {
                $district = $this->repository->findDistrict($districtName, $state->id);

                if ($district === null) {
                    $errors[] = "District '{$districtName}' does not belong to state '{$state->name}'.";
                }
            }
        }

        return [$state, $district];
    }

    /**
     * @param  array<int, string>  $errors
     * @return array{0: ?State, 1: ?District, 2: ?City}
     */
    private function resolveOptionalStateDistrictAndCity(string $stateValue, string $districtValue, string $cityValue, array &$errors): array
    {
        [$state, $district] = $this->resolveOptionalStateAndDistrict($stateValue, $districtValue, $errors);

        $cityName = trim($cityValue);
        $city = null;

        if ($cityName !== '') {
            if ($district === null) {
                $errors[] = 'District is required when City is provided.';
            } else {
                $city = $this->repository->findCity($cityName, $district->id);

                if ($city === null) {
                    $errors[] = "City '{$cityName}' does not belong to district '{$district->name}'.";
                }
            }
        }

        return [$state, $district, $city];
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateActivity(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['activity_name'], 'Activity Name', $errors, 255);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($name !== null) {
            $duplicate = $this->markDuplicate($seen, 'activities:name:'.$this->key($name))
                || $this->repository->exists(Activity::class, ['name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateEngineerType(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['engineer_type_name'], 'Engineer Type Name', $errors, 255);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($name !== null) {
            $duplicate = $this->markDuplicate($seen, 'engineer-types:name:'.$this->key($name))
                || $this->repository->exists(EngineerType::class, ['name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateUnit(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['unit_name'], 'Unit Name', $errors, 255);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($name !== null) {
            $duplicate = $this->markDuplicate($seen, 'units:name:'.$this->key($name))
                || $this->repository->exists(Unit::class, ['name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateDepartment(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['department_name'], 'Department Name', $errors, 255);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($name !== null) {
            $duplicate = $this->markDuplicate($seen, 'departments:name:'.$this->key($name))
                || $this->repository->exists(Department::class, ['name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateScheduleName(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['name'], 'Name', $errors, 255);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($name !== null) {
            $duplicate = $this->markDuplicate($seen, 'schedule-names:name:'.$this->key($name))
                || $this->repository->exists(ScheduleName::class, ['name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateScheduleType(array $values, array &$seen): array
    {
        $errors = [];
        $scheduleName = $this->resolveScheduleName($values['schedule_name'], $errors);
        $name = $this->requireText($values['schedule_type_name'], 'Schedule Type Name', $errors, 255);
        $shortName = $this->requireText($values['schedule_type_short_name'], 'Schedule Type Short Name', $errors, 20);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($scheduleName !== null && $name !== null) {
            $duplicateKey = 'schedule-types:'.$scheduleName->id.':'.$this->key($name);
            $duplicate = $this->markDuplicate($seen, $duplicateKey)
                || $this->repository->exists(ScheduleType::class, ['schedule_name_id' => $scheduleName->id, 'name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'schedule_name_id' => $scheduleName?->id,
            'name' => $name,
            'short_name' => $shortName,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<string, string>  $values
     * @param  array<string, bool>  $seen
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function validateProject(array $values, array &$seen): array
    {
        $errors = [];
        $name = $this->requireText($values['project_name'], 'Project Name', $errors, 255);
        $customer = $this->resolveCustomer($values['client'], $errors);
        $zone = $this->resolveZone($values['zone'], $errors);
        $division = $this->resolveDivision($values['division'], $zone, $errors);
        $loa = $this->resolveLoa($values['loa_number'], $errors);
        $contractValue = $this->requireDecimal($values['contract_value'], 'Contract Value', $errors);
        $status = $this->parseStatus($values['status'], false, $errors);
        $duplicate = false;

        if ($name !== null) {
            $duplicate = $this->markDuplicate($seen, 'projects:name:'.$this->key($name))
                || $this->repository->exists(Project::class, ['name' => $name]);
        }

        return $this->rowResult($errors, $duplicate, [
            'name' => $name,
            'customer_id' => $customer?->id,
            'zone_id' => $zone?->id,
            'division_id' => $division?->id,
            'loa_id' => $loa?->id,
            'contract_value' => $contractValue,
            'active_status' => $status,
        ]);
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function resolveScheduleName(string $value, array &$errors): ?ScheduleName
    {
        $name = $this->requireText($value, 'Schedule Name', $errors, 255);

        if ($name === null) {
            return null;
        }

        $scheduleName = $this->repository->findScheduleName($name);

        if ($scheduleName === null) {
            $errors[] = "Schedule Name '{$name}' does not exist.";
        }

        return $scheduleName;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function resolveCustomer(string $value, array &$errors): ?Customer
    {
        $name = $this->requireText($value, 'Client', $errors, 255);

        if ($name === null) {
            return null;
        }

        $customer = $this->repository->findCustomer($name);

        if ($customer === null) {
            $errors[] = "Client '{$name}' does not exist.";
        }

        return $customer;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function resolveLoa(string $value, array &$errors): ?Loa
    {
        $loaNumber = $this->requireText($value, 'LOA Number', $errors, 100);

        if ($loaNumber === null) {
            return null;
        }

        $loa = $this->repository->findLoa($loaNumber);

        if ($loa === null) {
            $errors[] = "LOA Number '{$loaNumber}' does not exist.";
        }

        return $loa;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function requireDecimal(string $value, string $label, array &$errors): ?float
    {
        $value = trim($value);

        if ($value === '') {
            $errors[] = "{$label} is required.";

            return null;
        }

        if (! is_numeric($value)) {
            $errors[] = "{$label} must be numeric.";

            return null;
        }

        $number = (float) $value;

        if ($number < 0) {
            $errors[] = "{$label} must not be negative.";
        }

        return $number;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function resolveState(string $value, array &$errors): ?State
    {
        $name = $this->requireText($value, 'State', $errors, 255);

        if ($name === null) {
            return null;
        }

        $state = $this->repository->findState($name);

        if ($state === null) {
            $errors[] = "State '{$name}' does not exist.";
        }

        return $state;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function resolveDistrict(string $value, ?State $state, array &$errors): ?District
    {
        $name = $this->requireText($value, 'District', $errors, 255);

        if ($name === null || $state === null) {
            return null;
        }

        $district = $this->repository->findDistrict($name, $state->id);

        if ($district === null) {
            $errors[] = "District '{$name}' does not belong to state '{$state->name}'.";
        }

        return $district;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function resolveZone(string $value, array &$errors): ?Zone
    {
        $name = $this->requireText($value, 'Zone', $errors, 255);

        if ($name === null) {
            return null;
        }

        $zone = $this->repository->findZone($name);

        if ($zone === null) {
            $errors[] = "Zone '{$name}' does not exist.";
        }

        return $zone;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function resolveDivision(string $value, ?Zone $zone, array &$errors): ?Division
    {
        $name = $this->requireText($value, 'Division', $errors, 255);

        if ($name === null || $zone === null) {
            return null;
        }

        $division = $this->repository->findDivision($name, $zone->id);

        if ($division === null) {
            $errors[] = "Division '{$name}' does not belong to zone '{$zone->name}'.";
        }

        return $division;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function requireText(string $value, string $label, array &$errors, ?int $max = null): ?string
    {
        $value = trim($value);

        if ($value === '') {
            $errors[] = "{$label} is required.";

            return null;
        }

        if ($max !== null && mb_strlen($value) > $max) {
            $errors[] = "{$label} must not be greater than {$max} characters.";
        }

        return $value;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function optionalText(string $value, string $label, array &$errors, ?int $max = null): ?string
    {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        if ($max !== null && mb_strlen($value) > $max) {
            $errors[] = "{$label} must not be greater than {$max} characters.";
        }

        return $value;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function optionalNumber(string $value, string $label, array &$errors, float $min, float $max): ?float
    {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        if (! is_numeric($value)) {
            $errors[] = "{$label} must be numeric.";

            return null;
        }

        $number = (float) $value;

        if ($number < $min || $number > $max) {
            $errors[] = "{$label} must be between {$min} and {$max}.";
        }

        return $number;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function parseStatus(string $value, bool $required, array &$errors): bool
    {
        $value = trim($value);

        if ($value === '') {
            if ($required) {
                $errors[] = 'Status is required.';
            }

            return true;
        }

        return match (strtolower($value)) {
            'active', '1', 'yes', 'true' => true,
            'inactive', 'in active', '0', 'no', 'false' => false,
            default => $this->invalidStatus($value, $errors),
        };
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function invalidStatus(string $value, array &$errors): bool
    {
        $errors[] = "Status '{$value}' must be Active or Inactive.";

        return true;
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array{status: string, errors: array<int, string>, attributes: array<string, mixed>}
     */
    private function rowResult(array $errors, bool $duplicate, array $attributes): array
    {
        if ($errors !== []) {
            return [
                'status' => 'invalid',
                'errors' => $errors,
                'attributes' => $attributes,
            ];
        }

        if ($duplicate) {
            return [
                'status' => 'duplicate',
                'errors' => ['Duplicate record found.'],
                'attributes' => $attributes,
            ];
        }

        return [
            'status' => 'valid',
            'errors' => [],
            'attributes' => $attributes,
        ];
    }

    /**
     * @param  array<string, bool>  $seen
     */
    private function markDuplicate(array &$seen, string $key): bool
    {
        if (isset($seen[$key])) {
            return true;
        }

        $seen[$key] = true;

        return false;
    }

    private function key(string $value): string
    {
        return mb_strtolower(trim($value));
    }

    /**
     * @param  array<int, mixed>  $rawRow
     */
    private function isEmptyRawRow(array $rawRow): bool
    {
        foreach ($rawRow as $value) {
            if ($this->cellValue($value) !== '') {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<string, string>  $values
     */
    private function isEmptyValuesRow(array $values): bool
    {
        foreach ($values as $value) {
            if (trim($value) !== '') {
                return false;
            }
        }

        return true;
    }

    private function cellValue(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        if (is_float($value) && floor($value) === $value) {
            return number_format($value, 0, '.', '');
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        return trim((string) $value);
    }

    /**
     * @return array{module: string, original_name: string|null, path: string}
     */
    private function readMeta(string $module, string $token): array
    {
        $metaPath = self::BASE_DIRECTORY.'/'.$module.'/'.$token.'.json';

        if (! Storage::disk('local')->exists($metaPath)) {
            throw ValidationException::withMessages([
                'token' => 'Import preview expired. Please upload the file again.',
            ]);
        }

        /** @var array{module: string, original_name: string|null, path: string} $meta */
        $meta = json_decode((string) Storage::disk('local')->get($metaPath), true, 512, JSON_THROW_ON_ERROR);

        if (($meta['module'] ?? null) !== $module || ! Storage::disk('local')->exists($meta['path'])) {
            throw ValidationException::withMessages([
                'token' => 'Import preview expired. Please upload the file again.',
            ]);
        }

        return $meta;
    }

    private function deleteStoredFile(string $module, string $token, string $path): void
    {
        Storage::disk('local')->delete($path);
        Storage::disk('local')->delete(self::BASE_DIRECTORY.'/'.$module.'/'.$token.'.json');
    }
}
