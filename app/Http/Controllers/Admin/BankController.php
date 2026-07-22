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
        $sort = $request->string('sort', 'name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['name', 'created_at'], true)) {
            $sort = 'name';
        }

        $query = Bank::query()
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $banks = $this->paginateQuery($query, $perPage);

        $banks->through(fn (Bank $bank) => [
            'unique_id' => $bank->unique_id,
            'name' => $bank->name,
            'active_status' => $bank->active_status,
            'created_at' => $bank->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/banks/index', [
            'banks' => $banks,
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
        return Inertia::render('admin/banks/create');
    }

    public function store(StoreBankRequest $request): RedirectResponse
    {
        Bank::query()->create($request->validated());

        return redirect()->route('admin.banks.index')->with('success', 'Bank created successfully.');
    }

    public function edit(Bank $bank): Response
    {
        return Inertia::render('admin/banks/edit', [
            'bank' => $bank->only(['unique_id', 'name', 'active_status']),
        ]);
    }

    public function update(UpdateBankRequest $request, Bank $bank): RedirectResponse
    {
        $bank->update($request->validated());

        return redirect()->route('admin.banks.index')->with('success', 'Bank updated successfully.');
    }

    public function destroy(Bank $bank): RedirectResponse
    {
        if ($bank->financialSecurities()->exists()) {
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
