<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVendorRequest;
use App\Http\Requests\Admin\UpdateVendorRequest;
use App\Models\District;
use App\Models\State;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'company_name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['company_name', 'name', 'contact_no', 'created_at'], true)) {
            $sort = 'company_name';
        }

        $query = Vendor::query()
            ->with(['state:id,name', 'district:id,name'])
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('company_name', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('contact_no', 'like', "%{$search}%")
                    ->orWhere('pan_no', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $vendors = $this->paginateQuery($query, $perPage);

        $vendors->through(fn (Vendor $vendor) => [
            'unique_id' => $vendor->unique_id,
            'company_name' => $vendor->company_name,
            'name' => $vendor->name,
            'contact_no' => $vendor->contact_no,
            'email' => $vendor->email,
            'pan_no' => $vendor->pan_no,
            'state' => $vendor->state?->name,
            'district' => $vendor->district?->name,
            'active_status' => $vendor->active_status,
            'created_at' => $vendor->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/vendors/index', [
            'vendors' => $vendors,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/vendors/create', [
            'states' => $this->stateOptions(),
            'districts' => $this->districtOptions(),
        ]);
    }

    public function store(StoreVendorRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);
        $validated['pan_proof_path'] = $request->file('pan_proof')->store('vendors/pan-proofs', 'public');
        $validated['bank_proof_path'] = $request->file('bank_proof')->store('vendors/bank-proofs', 'public');
        unset($validated['pan_proof'], $validated['bank_proof']);

        Vendor::query()->create($validated);

        return redirect()->route('admin.vendors.index')->with('success', 'Vendor created successfully.');
    }

    public function edit(Vendor $vendor): Response
    {
        return Inertia::render('admin/vendors/edit', [
            'vendor' => [
                ...$vendor->only([
                    'unique_id',
                    'company_name',
                    'name',
                    'contact_no',
                    'alternate_contact_no',
                    'email',
                    'gst_no',
                    'pan_no',
                    'pincode',
                    'state_id',
                    'district_id',
                    'zone_name',
                    'bank_name',
                    'branch_name',
                    'account_no',
                    'ifsc_code',
                    'account_holder_name',
                    'address',
                    'username',
                    'active_status',
                ]),
                'pan_proof_url' => $vendor->pan_proof_path ? Storage::disk('public')->url($vendor->pan_proof_path) : null,
                'bank_proof_url' => $vendor->bank_proof_path ? Storage::disk('public')->url($vendor->bank_proof_path) : null,
            ],
            'states' => $this->stateOptions(),
            'districts' => $this->districtOptions(),
        ]);
    }

    public function update(UpdateVendorRequest $request, Vendor $vendor): RedirectResponse
    {
        $validated = $request->validated();

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if ($request->hasFile('pan_proof')) {
            Storage::disk('public')->delete($vendor->pan_proof_path);
            $validated['pan_proof_path'] = $request->file('pan_proof')->store('vendors/pan-proofs', 'public');
        }

        if ($request->hasFile('bank_proof')) {
            Storage::disk('public')->delete($vendor->bank_proof_path);
            $validated['bank_proof_path'] = $request->file('bank_proof')->store('vendors/bank-proofs', 'public');
        }

        unset($validated['pan_proof'], $validated['bank_proof']);

        $vendor->update($validated);

        return redirect()->route('admin.vendors.index')->with('success', 'Vendor updated successfully.');
    }

    public function destroy(Vendor $vendor): RedirectResponse
    {
        $vendor->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.vendors.index')->with('success', 'Vendor deleted successfully.');
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function stateOptions(): array
    {
        return State::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

    /**
     * @return array<int, array{id: int, name: string, state_id: int}>
     */
    private function districtOptions(): array
    {
        return District::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name', 'state_id'])
            ->toArray();
    }
}
