<?php

namespace App\DataTables;

use Illuminate\Contracts\Database\Eloquent\Builder;

class BPDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'IDbp',
                'name' => 'IDbp',
                'searchable' => true,
                'orderable' => true
            ],
            'desc' => [
                'data' => 'desc',
                'name' => 'desc',
                'searchable' => true,
                'orderable' => true
            ],
            'supplier' => [
                'data' => 'supplier',
                'name' => 'supplier',
                'searchable' => true,
                'orderable' => true
            ],
            'customer' => [
                'data' => 'customer',
                'name' => 'customer',
                'searchable' => true,
                'orderable' => true
            ],
            'bp_destinations_count' => [
                'data' => 'bp_destinations_count',
                'name' => 'bp_destinations_count',
            ],
            'address' => [
                'data' => 'address.full_address',
                'name' => 'address.address',
                'searchable' => true,
                'orderable' => true
            ],
            'vat' => [
                'data' => 'vat',
                'name' => 'vat',
                'searchable' => true,
                'orderable' => true
            ],
            'is_invoice' => [
                'data' => 'is_invoice',
                'name' => 'is_invoice',
                'searchable' => true,
                'orderable' => true
            ],
            'is_purchase' => [
                'data' => 'is_purchase',
                'name' => 'is_purchase',
                'searchable' => true,
                'orderable' => true
            ],
            'is_shipping' => [
                'data' => 'is_shipping',
                'name' => 'is_shipping',
                'searchable' => true,
                'orderable' => true
            ],
            'is_sales' => [
                'data' => 'is_sales',
                'name' => 'is_sales',
                'searchable' => true,
                'orderable' => true
            ],
            'is_blocked' => [
                'data' => 'is_blocked',
                'name' => 'is_blocked',
                'searchable' => true,
                'orderable' => true
            ],
            'is_carrier' => [
                'data' => 'is_carrier',
                'name' => 'is_carrier',
                'searchable' => true,
                'orderable' => true
            ],
            'is_active' => [
                'data' => 'is_active',
                'name' => 'is_active',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

    protected function build(): static
    {
        return $this
            ->filterColumn('address', function($builder, $keyword) {
                $this->getQuery()
                    ->leftJoin('addresses', 'addresses.id', '=', 'bp.address_id')
                    ->leftJoin('nations', 'nations.id', '=', 'addresses.nation_id')
                    ->leftJoin('provinces', 'provinces.id', '=', 'addresses.province_id')
                    ->leftJoin('cities', 'cities.id', '=', 'addresses.city_id')
                    ->leftJoin('zips', 'zips.id', '=', 'addresses.zip_id');

                $operator = $this->getColumnSearchOperator('address');
                $builder->orWhere(function (Builder $query) use ($keyword, $operator) {
                    $this->compileQuerySearch($query, 'addresses.address', $keyword, 'or', false, $operator);
                    $this->compileQuerySearch($query, 'nations.name', $keyword, 'or', false, $operator);
                    $this->compileQuerySearch($query, 'provinces.name', $keyword, 'or', false, $operator);
                    $this->compileQuerySearch($query, 'cities.name', $keyword, 'or', false, $operator);
                    $this->compileQuerySearch($query, 'zips.code', $keyword, 'or', false, $operator);
                });
            });
    }
}