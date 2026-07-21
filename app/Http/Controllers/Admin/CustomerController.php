<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCustomerRequest;
use App\Http\Requests\Admin\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\District;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['name', 'contact_name', 'created_at'], true)) {
            $sort = 'name';
        }

        $query = Customer::query()
            ->with(['state:id,name', 'district:id,name'])
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%")
                    ->orWhere('pin_code', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $customers = $this->paginateQuery($query, $perPage);

        $customers->through(fn (Customer $customer) => [
            'unique_id' => $customer->unique_id,
            'name' => $customer->name,
            'contact_name' => $customer->contact_name,
            'contact_number' => $customer->contact_number,
            'state_id' => $customer->state_id,
            'state' => $customer->state?->name,
            'district_id' => $customer->district_id,
            'district' => $customer->district?->name,
            'pin_code' => $customer->pin_code,
            'active_status' => $customer->active_status,
            'created_at' => $customer->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
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
        return Inertia::render('admin/customers/create', [
            'states' => $this->stateOptions(),
            'districts' => $this->districtOptions(),
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        Customer::query()->create($request->validated());

        return redirect()->route('admin.customers.index')->with('success', 'Customer created successfully.');
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('admin/customers/edit', [
            'customer' => $customer->only([
                'unique_id',
                'name',
                'billing_address',
                'pin_code',
                'state_id',
                'district_id',
                'zone',
                'contact_name',
                'contact_number',
                'contact_landline_number',
                'email',
                'active_status',
            ]),
            'states' => $this->stateOptions(),
            'districts' => $this->districtOptions(),
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return redirect()->route('admin.customers.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.customers.index')->with('success', 'Customer deleted successfully.');
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
