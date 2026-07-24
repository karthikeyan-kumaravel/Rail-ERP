<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePurchaseOrderRequest;
use App\Http\Requests\Admin\UpdatePurchaseOrderRequest;
use App\Models\Loa;
use App\Models\LoaItem;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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
            'order_date',
            'delivery_date',
            'ordered_qty',
            'received_qty',
            'status',
            'created_at',
        ], true)) {
            $sort = 'order_date';
        }

        $activePurchaseOrders = PurchaseOrder::query()->where('is_delete', false);

        $query = (clone $activePurchaseOrders)
            ->with([
                'loa:id,loa_number',
                'loaItem:id,item_no,item_description',
                'vendor:id,company_name',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('po_number', 'like', "%{$search}%")
                        ->orWhereHas('vendor', fn ($query) => $query->where('company_name', 'like', "%{$search}%"))
                        ->orWhereHas('loa', fn ($query) => $query->where('loa_number', 'like', "%{$search}%"));
                });
            })
            ->orderBy($sort, $direction);

        $purchaseOrders = $this->paginateQuery($query, $perPage);

        $purchaseOrders->through(fn (PurchaseOrder $purchaseOrder) => [
            'unique_id' => $purchaseOrder->unique_id,
            'po_number' => $purchaseOrder->po_number,
            'order_date' => $purchaseOrder->order_date->format('Y-m-d'),
            'loa_number' => $purchaseOrder->loa?->loa_number,
            'loa_item_description' => $purchaseOrder->loaItem?->item_description,
            'vendor_name' => $purchaseOrder->vendor?->company_name,
            'ordered_qty' => $purchaseOrder->ordered_qty,
            'received_qty' => $purchaseOrder->received_qty,
            'balance_qty' => $purchaseOrder->balance_qty,
            'unit_price_incl_gst' => $purchaseOrder->unit_price_incl_gst,
            'unit_price_excl_gst' => $purchaseOrder->unit_price_excl_gst,
            'agreed_rate' => $purchaseOrder->agreed_rate,
            'total_price_incl_gst' => $purchaseOrder->total_price_incl_gst,
            'total_price_excl_gst' => $purchaseOrder->total_price_excl_gst,
            'vendor_quote_price' => $purchaseOrder->vendor_quote_price,
            'variance_percentage' => $purchaseOrder->variance_percentage,
            'delivery_date' => $purchaseOrder->delivery_date->format('Y-m-d'),
            'status' => $purchaseOrder->status,
            'payment_type' => $purchaseOrder->payment_type,
            'created_at' => $purchaseOrder->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/purchase-orders/index', [
            'purchaseOrders' => $purchaseOrders,
            'stats' => [
                'total_pos' => (clone $activePurchaseOrders)->count(),
                'total_value' => (string) (clone $activePurchaseOrders)->sum('total_price_incl_gst'),
                'fully_received' => (clone $activePurchaseOrders)->where('status', 'Fully Received')->count(),
                'pending' => (clone $activePurchaseOrders)->where('status', '!=', 'Fully Received')->count(),
            ],
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
            'status_options' => PurchaseOrder::STATUSES,
            'payment_type_options' => PurchaseOrder::PAYMENT_TYPES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/purchase-orders/create', [
            'loas' => $this->loaOptions(),
            'loa_items' => $this->loaItemOptions(),
            'vendors' => $this->vendorOptions(),
            'status_options' => PurchaseOrder::STATUSES,
            'payment_type_options' => PurchaseOrder::PAYMENT_TYPES,
        ]);
    }

    public function store(StorePurchaseOrderRequest $request): RedirectResponse
    {
        $items = $request->validated()['items'];

        DB::transaction(function () use ($items): void {
            foreach ($items as $item) {
                PurchaseOrder::query()->create([
                    ...$item,
                    'balance_qty' => $this->calculateBalanceQty($item['ordered_qty'], $item['received_qty']),
                    'variance_percentage' => $this->calculateVariancePercentage(
                        $item['vendor_quote_price'],
                        $item['agreed_rate'],
                    ),
                ]);
            }
        });

        return redirect()->route('admin.purchase-orders.index')
            ->with('success', 'Purchase order created successfully.');
    }

    public function edit(PurchaseOrder $purchaseOrder): Response
    {
        return Inertia::render('admin/purchase-orders/edit', [
            'purchaseOrder' => [
                'unique_id' => $purchaseOrder->unique_id,
                'po_number' => $purchaseOrder->po_number,
                'order_date' => $purchaseOrder->order_date->format('Y-m-d'),
                'loa_id' => $purchaseOrder->loa_id,
                'loa_item_id' => $purchaseOrder->loa_item_id,
                'vendor_id' => $purchaseOrder->vendor_id,
                'ordered_qty' => $purchaseOrder->ordered_qty,
                'received_qty' => $purchaseOrder->received_qty,
                'balance_qty' => $purchaseOrder->balance_qty,
                'unit_price_incl_gst' => $purchaseOrder->unit_price_incl_gst,
                'unit_price_excl_gst' => $purchaseOrder->unit_price_excl_gst,
                'agreed_rate' => $purchaseOrder->agreed_rate,
                'total_price_incl_gst' => $purchaseOrder->total_price_incl_gst,
                'total_price_excl_gst' => $purchaseOrder->total_price_excl_gst,
                'vendor_quote_price' => $purchaseOrder->vendor_quote_price,
                'variance_percentage' => $purchaseOrder->variance_percentage,
                'delivery_date' => $purchaseOrder->delivery_date->format('Y-m-d'),
                'status' => $purchaseOrder->status,
                'payment_type' => $purchaseOrder->payment_type,
            ],
            'loas' => $this->loaOptions(),
            'loa_items' => $this->loaItemOptions(),
            'vendors' => $this->vendorOptions(),
            'status_options' => PurchaseOrder::STATUSES,
            'payment_type_options' => PurchaseOrder::PAYMENT_TYPES,
        ]);
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $data = $request->validated();

        $purchaseOrder->update([
            ...$data,
            'balance_qty' => $this->calculateBalanceQty($data['ordered_qty'], $data['received_qty']),
            'variance_percentage' => $this->calculateVariancePercentage(
                $data['vendor_quote_price'],
                $data['agreed_rate'],
            ),
        ]);

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

    private function calculateBalanceQty(int|float|string $orderedQty, int|float|string $receivedQty): float
    {
        return round((float) $orderedQty - (float) $receivedQty, 3);
    }

    private function calculateVariancePercentage(int|float|string $vendorQuotePrice, int|float|string $agreedRate): ?float
    {
        $agreedRate = (float) $agreedRate;

        if ($agreedRate <= 0.0) {
            return null;
        }

        return round((((float) $vendorQuotePrice - $agreedRate) / $agreedRate) * 100, 2);
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function loaOptions(): array
    {
        return Loa::query()
            ->where('is_delete', false)
            ->orderBy('loa_number')
            ->get(['id', 'loa_number'])
            ->map(fn (Loa $loa) => ['id' => $loa->id, 'name' => $loa->loa_number ?? "LOA #{$loa->id}"])
            ->toArray();
    }

    /**
     * Every active LOA item, each carrying its own `loa_id` so the frontend
     * can filter the list down to the selected LOA — the same
     * preload-then-filter-client-side pattern used throughout this app for
     * dependent dropdowns (see LoaController's station/schedule-type
     * options).
     *
     * @return array<int, array{id: int, loa_id: int, name: string, quantity_unit: string, ordered_qty: string, agreed_rate: string}>
     */
    private function loaItemOptions(): array
    {
        return LoaItem::query()
            ->whereHas('loa', fn ($query) => $query->where('is_delete', false))
            ->orderBy('item_no')
            ->get(['id', 'loa_id', 'item_no', 'item_description', 'quantity_unit', 'item_quantity', 'bid_rate'])
            ->map(fn (LoaItem $item) => [
                'id' => $item->id,
                'loa_id' => $item->loa_id,
                'name' => "{$item->item_no} — ".Str::limit($item->item_description, 60),
                'quantity_unit' => $item->quantity_unit,
                'ordered_qty' => (string) $item->item_quantity,
                'agreed_rate' => (string) $item->bid_rate,
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function vendorOptions(): array
    {
        return Vendor::query()
            ->where('is_delete', false)
            ->orderBy('company_name')
            ->get(['id', 'company_name'])
            ->map(fn (Vendor $vendor) => ['id' => $vendor->id, 'name' => $vendor->company_name])
            ->toArray();
    }
}
