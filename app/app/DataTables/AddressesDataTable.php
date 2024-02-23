<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class AddressesDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'name' => [
                'data' => 'name',
                'name' => 'name',
                'searchable' => true,
                'orderable' => true
            ],
            'company' => [
                'data' => 'company_id',
                'name' => 'company_id',
                'searchable' => true,
                'orderable' => true
            ],
            'nation' => [
                'data' => 'nation',
                'name' => 'nation_id',
                'searchable' => true,
                'orderable' => true
            ],
            'province' => [
                'data' => 'province',
                'name' => 'province.name',
                'searchable' => true,
                'orderable' => true
            ],
            'city' => [
                'data' => 'city',
                'name' => 'city.name',
                'searchable' => true,
                'orderable' => true
            ],
            'zip' => [
                'data' => 'zip',
                'name' => 'zip_id',
                'searchable' => true,
                'orderable' => true
            ],
            'address' => [
                'data' => 'address',
                'name' => 'address',
                'searchable' => true,
                'orderable' => true
            ],
            'street_number' => [
                'data' => 'street_number',
                'name' => 'street_number',
                'searchable' => true,
                'orderable' => true
            ],
            'timezone' => [
                'data' => 'timezone',
                'name' => 'timezone',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

    protected function build(): static
    {
        return $this
            ->filterColumn('zip', function($builder, $keyword) {
                $this->getQuery()->leftJoin('zips', 'addresses.zip_id', '=', 'zips.id');
                $operator = $this->getColumnSearchOperator('date_lot');
                $builder->orWhere(function (Builder $query) use ($keyword, $operator) {
                    $this->compileQuerySearch($query, 'zips.code', $keyword, 'or', false, $operator);
                    $this->compileQuerySearch($query, 'zips.description', $keyword, 'or', false, $operator);
                });
            });
    }
}