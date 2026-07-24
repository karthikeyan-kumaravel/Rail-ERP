<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePurchaseOrderRequest;
use App\Http\Requests\Admin\UpdatePurchaseOrderRequest;
use App\Models\PurchaseOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'order_date')->toString();
        $direction = $request->string('direction', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, [
            'po_number',
            'supplier',
            'order_date',
            'amount',
            'delivery_date',
            'payment_terms',
            'total_qty',
            'received_qty',
            'inspection_status',
            'dispatch_status',
            'created_at',
        ], true)) {
            $sort = 'order_date';
        }

        $activePurchaseOrders = PurchaseOrder::query()->where('is_delete', false);

        $query = (clone $activePurchaseOrders)
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('po_number', 'like', "%{$search}%")
                        ->orWhere('supplier', 'like', "%{$search}%")
                        ->orWhere('items_description', 'like', "%{$search}%")
                        ->orWhere('payment_terms', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction);

        $purchaseOrders = $this->paginateQuery($query, $perPage);

        $purchaseOrders->through(fn (PurchaseOrder $purchaseOrder) => [
            'unique_id' => $purchaseOrder->unique_id,
            'po_number' => $purchaseOrder->po_number,
            'supplier' => $purchaseOrder->supplier,
            'items_description' => $purchaseOrder->items_description,
            'order_date' => $purchaseOrder->order_date->format('Y-m-d'),
            'amount' => $purchaseOrder->amount,
            'delivery_date' => $purchaseOrder->delivery_date->format('Y-m-d'),
            'payment_terms' => $purchaseOrder->payment_terms,
            'total_qty' => $purchaseOrder->total_qty,
            'received_qty' => $purchaseOrder->received_qty,
            'inspection_status' => $purchaseOrder->inspection_status,
            'dispatch_status' => $purchaseOrder->dispatch_status,
            'created_at' => $purchaseOrder->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/purchase-orders/index', [
            'purchaseOrders' => $purchaseOrders,
            'stats' => [
                'total_pos' => (clone $activePurchaseOrders)->count(),
                'total_value' => (string) (clone $activePurchaseOrders)->sum('amount'),
                'completed' => (clone $activePurchaseOrders)->where('dispatch_status', 'completed')->count(),
                'pending' => (clone $activePurchaseOrders)->where('dispatch_status', '!=', 'completed')->count(),
            ],
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
            'status_options' => [
                'inspection_status' => PurchaseOrder::INSPECTION_STATUSES,
                'dispatch_status' => PurchaseOrder::DISPATCH_STATUSES,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/purchase-orders/create', [
            'status_options' => [
                'inspection_status' => PurchaseOrder::INSPECTION_STATUSES,
                'dispatch_status' => PurchaseOrder::DISPATCH_STATUSES,
            ],
        ]);
    }

    public function store(StorePurchaseOrderRequest $request): RedirectResponse
    {
        PurchaseOrder::query()->create($request->validated());

        return redirect()->route('admin.purchase-orders.index')
            ->with('success', 'Purchase order created successfully.');
    }

    public function edit(PurchaseOrder $purchaseOrder): Response
    {
        return Inertia::render('admin/purchase-orders/edit', [
            'purchaseOrder' => [
                'unique_id' => $purchaseOrder->unique_id,
                'po_number' => $purchaseOrder->po_number,
                'supplier' => $purchaseOrder->supplier,
                'items_description' => $purchaseOrder->items_description,
                'order_date' => $purchaseOrder->order_date->format('Y-m-d'),
                'amount' => $purchaseOrder->amount,
                'delivery_date' => $purchaseOrder->delivery_date->format('Y-m-d'),
                'payment_terms' => $purchaseOrder->payment_terms,
                'total_qty' => $purchaseOrder->total_qty,
                'received_qty' => $purchaseOrder->received_qty,
                'inspection_status' => $purchaseOrder->inspection_status,
                'dispatch_status' => $purchaseOrder->dispatch_status,
            ],
            'status_options' => [
                'inspection_status' => PurchaseOrder::INSPECTION_STATUSES,
                'dispatch_status' => PurchaseOrder::DISPATCH_STATUSES,
            ],
        ]);
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $purchaseOrder->update($request->validated());

        return redirect()->route('admin.purchase-orders.index')
            ->with('success', 'Purchase order updated successfully.');
    }

    public function destroy(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        $purchaseOrder->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.purchase-orders.index')
            ->with('success', 'Purchase order deleted successfully.');
    }
}
