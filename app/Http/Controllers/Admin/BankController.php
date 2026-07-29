<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBankRequest;
use App\Http\Requests\Admin\UpdateBankRequest;
use App\Models\Bank;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $bankName = $request->string('bank_name')->trim()->toString();
        $holderName = $request->string('holder_name')->trim()->toString();
        $sort = $request->string('sort', 'name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['name', 'created_at'], true)) {
            $sort = 'name';
        }
        $query = Bank::query()
            ->where('is_delete', 0)
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($bankName, function ($query) use ($bankName) {
                $query->where('name', $bankName);
            })
            ->when($holderName, function ($query) use ($holderName) {
                $query->where('account_holder_name', $holderName);
            })
            ->orderBy($sort, $direction);

        $banks = $this->paginateQuery($query, $perPage);

        $banks->through(fn (Bank $bank) => [
            'unique_id' => $bank->unique_id,
            'name' => $bank->name,
            'branch_name' => $bank->branch_name,
            'ifsc_code' => $bank->ifsc_code,
            'account_number' => $bank->account_number,
            'account_holder_name' => $bank->account_holder_name,
            'account_type' => $bank->account_type,
            'bank_address' => $bank->bank_address,
            'pincode' => $bank->pincode,
            'contact_number' => $bank->contact_number,
            'email' => $bank->email,
            'active_status' => $bank->active_status,
            'created_at' => $bank->created->format('d M Y'),
        ]);

        $bankNames = Bank::query()
            ->where('is_delete', 0)
            ->orderBy('name')
            ->distinct()
            ->pluck('name');

        $holderNames = Bank::query()
            ->where('is_delete', 0)
            ->orderBy('account_holder_name')
            ->distinct()
            ->pluck('account_holder_name');

        return Inertia::render('admin/banks/index', [
            'banks' => $banks,
            'bankNames' => $bankNames,
            'holderNames' => $holderNames,
            'filters' => [
                'search' => $search,
                'bank_name' => $bankName,
                'holder_name' => $holderName,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/banks/create');
    }

    public function store(StoreBankRequest $request): RedirectResponse
    {
        Bank::create($request->validated());

        return redirect()
            ->route('admin.banks.index')
            ->with('success', 'Bank created successfully.');

    }

    public function show(Bank $bank): Response
    {
        return Inertia::render('admin/banks/show', [
            'bank' => $bank->only([
                'unique_id',
                'name',
                'branch_name',
                'ifsc_code',
                'account_number',
                'account_holder_name',
                'account_type',
                'bank_address',
                'pincode',
                'contact_number',
                'email',
                'active_status',
            ]),
        ]);
    }

    public function edit(Bank $bank): Response
    {
        return Inertia::render('admin/banks/edit', [
            'bank' => $bank->only([
                'unique_id',
                'name',
                'branch_name',
                'ifsc_code',
                'account_number',
                'account_holder_name',
                'account_type',
                'bank_address',
                'pincode',
                'contact_number',
                'email',
                'active_status',
            ]),
        ]);
    }

    public function update(UpdateBankRequest $request, Bank $bank): RedirectResponse
    {
        $bank->update($request->validated());

        return redirect()->route('admin.banks.index')->with('success', 'Bank updated successfully.');
    }

    public function destroy(Bank $bank): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        if ($bank->financialSecurities()->where('is_delete', false)->exists()) {
            return redirect()
                ->route('admin.banks.index')
                ->with('success', 'Bank cannot be deleted because it is assigned to an LOA financial security record.');
        }

        $bank->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.banks.index')->with('success', 'Bank deleted successfully.');
    }
}
