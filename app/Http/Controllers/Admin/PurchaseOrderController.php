<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePurchaseOrderRequest;
use App\Http\Requests\Admin\UpdatePurchaseOrderRequest;
use App\Models\Loa;
use App\Models\LoaItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Vendor;
use App\Support\LoaItemAllocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
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
            'status',
            'created_at',
        ], true)) {
            $sort = 'order_date';
        }

        $activePurchaseOrders = PurchaseOrder::query()->where('is_delete', false);

        $query = (clone $activePurchaseOrders)
            ->with([
                'loa:id,loa_number',
                'vendor:id,company_name',
            ])
            ->withCount('items')
            ->withSum('items as total_ordered_qty', 'ordered_qty')
            ->withSum('items as total_received_qty', 'received_qty')
            ->withSum('items as total_value_incl_gst', 'total_price_incl_gst')
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
            'vendor_name' => $purchaseOrder->vendor?->company_name,
            'items_count' => $purchaseOrder->items_count,
            'total_ordered_qty' => $purchaseOrder->total_ordered_qty,
            'total_received_qty' => $purchaseOrder->total_received_qty,
            'total_value_incl_gst' => $purchaseOrder->total_value_incl_gst,
            'delivery_date' => $purchaseOrder->delivery_date->format('Y-m-d'),
            'status' => $purchaseOrder->status,
            'payment_type' => $purchaseOrder->payment_type,
            'created_at' => $purchaseOrder->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/purchase-orders/index', [
            'purchaseOrders' => $purchaseOrders,
            'stats' => [
                'total_pos' => (clone $activePurchaseOrders)->count(),
                'total_value' => (string) PurchaseOrderItem::query()
                    ->whereHas('purchaseOrder', fn ($query) => $query->where('is_delete', false))
                    ->sum('total_price_incl_gst'),
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
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        DB::transaction(function () use ($data, $items): void {
            $this->ensureAllocationWithinLimits($items, null);

            $purchaseOrder = PurchaseOrder::query()->create($data);

            $this->replaceItems($purchaseOrder, $items);
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
                'vendor_id' => $purchaseOrder->vendor_id,
                'delivery_date' => $purchaseOrder->delivery_date->format('Y-m-d'),
                'status' => $purchaseOrder->status,
                'payment_type' => $purchaseOrder->payment_type,
                'items' => $purchaseOrder->items()->orderBy('order_no')->get([
                    'loa_item_id',
                    'ordered_qty',
                    'received_qty',
                    'unit_price_incl_gst',
                    'unit_price_excl_gst',
                    'agreed_rate',
                    'total_price_incl_gst',
                    'total_price_excl_gst',
                    'vendor_quote_price',
                ])->map(fn (PurchaseOrderItem $item) => [
                    'loa_item_id' => $item->loa_item_id,
                    'ordered_qty' => (string) $item->ordered_qty,
                    'received_qty' => (string) $item->received_qty,
                    'unit_price_incl_gst' => (string) $item->unit_price_incl_gst,
                    'unit_price_excl_gst' => (string) $item->unit_price_excl_gst,
                    'agreed_rate' => (string) $item->agreed_rate,
                    'total_price_incl_gst' => (string) $item->total_price_incl_gst,
                    'total_price_excl_gst' => (string) $item->total_price_excl_gst,
                    'vendor_quote_price' => (string) $item->vendor_quote_price,
                ])->toArray(),
            ],
            'loas' => $this->loaOptions(),
            'loa_items' => $this->loaItemOptions($purchaseOrder->id),
            'vendors' => $this->vendorOptions(),
            'status_options' => PurchaseOrder::STATUSES,
            'payment_type_options' => PurchaseOrder::PAYMENT_TYPES,
        ]);
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        DB::transaction(function () use ($purchaseOrder, $data, $items): void {
            $this->ensureAllocationWithinLimits($items, $purchaseOrder->id);

            $purchaseOrder->update($data);

            $this->replaceItems($purchaseOrder, $items);
        });

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

    /**
     * The authoritative allocation check, re-run with a row lock on the
     * affected LOA items inside the same write transaction as the save
     * itself. StorePurchaseOrderRequest/UpdatePurchaseOrderRequest already
     * ran this same check unlocked for fast form feedback, but that check
     * alone can race: two concurrent submissions against the same LOA line
     * item could each read "enough is available" before either has
     * written. Locking here serializes concurrent writers so the second
     * one to reach this point re-checks against the first one's committed
     * allocation.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    private function ensureAllocationWithinLimits(array $items, ?int $excludePurchaseOrderId): void
    {
        $requestedByLoaItem = [];

        foreach ($items as $item) {
            $loaItemId = (int) $item['loa_item_id'];
            $requestedByLoaItem[$loaItemId] = ($requestedByLoaItem[$loaItemId] ?? 0.0) + (float) $item['ordered_qty'];
        }

        if ($requestedByLoaItem === []) {
            return;
        }

        $availableByLoaItem = LoaItemAllocation::availableQuantities(
            array_keys($requestedByLoaItem),
            $excludePurchaseOrderId,
            lock: true,
        );

        foreach ($requestedByLoaItem as $loaItemId => $requestedQty) {
            $availableQty = (float) ($availableByLoaItem[$loaItemId] ?? 0.0);

            if ($requestedQty > $availableQty) {
                throw ValidationException::withMessages([
                    'items' => sprintf('Only %s is available for LOA line item #%d.', number_format($availableQty, 3), $loaItemId),
                ]);
            }
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    private function replaceItems(PurchaseOrder $purchaseOrder, array $items): void
    {
        $purchaseOrder->items()->delete();

        foreach ($items as $index => $item) {
            $purchaseOrder->items()->create([
                'loa_item_id' => $item['loa_item_id'],
                'ordered_qty' => $item['ordered_qty'],
                'received_qty' => $item['received_qty'],
                'balance_qty' => $this->calculateBalanceQty($item['ordered_qty'], $item['received_qty']),
                'unit_price_incl_gst' => $item['unit_price_incl_gst'],
                'unit_price_excl_gst' => $item['unit_price_excl_gst'],
                'agreed_rate' => $item['agreed_rate'],
                'total_price_incl_gst' => $item['total_price_incl_gst'],
                'total_price_excl_gst' => $item['total_price_excl_gst'],
                'vendor_quote_price' => $item['vendor_quote_price'],
                'variance_percentage' => $this->calculateVariancePercentage(
                    $item['vendor_quote_price'],
                    $item['agreed_rate'],
                ),
                'order_no' => $index,
            ]);
        }
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
     * can filter the list down to the selected LOA, plus `available_qty` —
     * the LOA item's ordered quantity minus whatever is already allocated to
     * it by other active purchase orders. $excludePurchaseOrderId lets the
     * edit form exclude the PO being edited from that "already allocated"
     * total, so its own existing items aren't double-counted against it.
     *
     * @return array<int, array{id: int, loa_id: int, name: string, quantity_unit: string, agreed_rate: string, available_qty: string}>
     */
    private function loaItemOptions(?int $excludePurchaseOrderId = null): array
    {
        $loaItems = LoaItem::query()
            ->whereHas('loa', fn ($query) => $query->where('is_delete', false))
            ->orderBy('item_no')
            ->get(['id', 'loa_id', 'item_no', 'item_description', 'quantity_unit', 'item_quantity', 'bid_rate']);

        $availableByLoaItem = LoaItemAllocation::availableQuantities(
            $loaItems->pluck('id')->all(),
            $excludePurchaseOrderId,
        );

        return $loaItems
            ->map(fn (LoaItem $item) => [
                'id' => $item->id,
                'loa_id' => $item->loa_id,
                'name' => "{$item->item_no} — ".Str::limit($item->item_description, 60),
                'quantity_unit' => $item->quantity_unit,
                'agreed_rate' => (string) $item->bid_rate,
                'available_qty' => (string) ($availableByLoaItem[$item->id] ?? 0.0),
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
