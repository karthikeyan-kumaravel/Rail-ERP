<?php

namespace App\Http\Controllers\Concerns;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Pagination\LengthAwarePaginator as LengthAwarePaginatorContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Shared "Show N entries" pagination handling for admin list (index) pages.
 *
 * @mixin Controller
 */
trait HasPaginatedIndex
{
    /**
     * The page sizes every admin list page accepts, in the order they should
     * be offered in the "Show" dropdown.
     *
     * @var array<int, int|string>
     */
    public const PER_PAGE_OPTIONS = [10, 25, 50, 100, 250, 500, 'All'];

    /**
     * Resolve and validate the "per_page" request input against the allowed
     * page sizes, defaulting to $default when missing or invalid.
     */
    protected function resolvePerPage(Request $request, int $default = 10): int|string
    {
        $value = $request->input('per_page', $default);

        if (is_string($value) && strtolower(trim($value)) === 'all') {
            return 'All';
        }

        $value = (int) $value;

        return in_array($value, [10, 25, 50, 100, 250, 500], true) ? $value : $default;
    }

    /**
     * Paginate a query builder, resolving "All" into a single page containing
     * every matching record. Still returns a real LengthAwarePaginator so the
     * from/to/total/links shape stays identical for the frontend regardless
     * of page size, and search/sort/filter clauses already applied to $query
     * are naturally respected.
     *
     * @param  Builder<*>  $query
     */
    protected function paginateQuery(Builder $query, int|string $perPage): LengthAwarePaginatorContract
    {
        if ($perPage !== 'All') {
            return $query->paginate($perPage)->withQueryString();
        }

        $total = (clone $query)->count();
        $items = $query->get();

        return (new LengthAwarePaginator($items, $total, max($total, 1), 1))
            ->withQueryString();
    }
}
