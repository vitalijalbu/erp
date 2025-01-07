<?php

namespace App\DataTables;

use Illuminate\Contracts\Database\Eloquent\Builder;

class ContactDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true,
            ],
            'name' => [
                'data' => 'name',
                'name' => 'name',
                'searchable' => true,
                'orderable' => true,
            ],
            'surname' => [
                'data' => 'surname',
                'name' => 'surname',
                'searchable' => true,
                'orderable' => true,
            ],
            'qualification' => [
                'data' => 'qualification',
                'name' => 'qualification',
                'searchable' => true,
                'orderable' => true,
            ],
            'department' => [
                'data' => 'department',
                'name' => 'department',
                'searchable' => true,
                'orderable' => true,
            ],
            'office_phone' => [
                'data' => 'office_phone',
                'name' => 'office_phone',
                'searchable' => true,
                'orderable' => true,
            ],
            'mobile_phone' => [
                'data' => 'mobile_phone',
                'name' => 'mobile_phone',
                'searchable' => true,
                'orderable' => true,
            ],
            'email' => [
                'data' => 'email',
                'name' => 'email',
                'searchable' => true,
                'orderable' => true,
            ],
            'language' => [
                'data' => 'language',
                'name' => 'language',
                'searchable' => true,
                'orderable' => true,
            ],
            'full_address' => [
                'data' => 'address.full_address',
                'name' => 'address.address',
                'searchable' => true,
                'orderable' => true,
            ],
            'is_employee' => [
                'data' => 'is_employee',
                'name' => 'is_employee',
                'searchable' => true,
                'orderable' => true,
            ],
            'type' => [
                'data' => 'type',
                'name' => 'type',
                'searchable' => true,
                'orderable' => true,
            ],
        ];
    }

    protected function build(): static
    {
        return $this
            ->filterColumn('full_address', function($builder, $keyword) {
                $this->getQuery()
                    ->leftJoin('addresses', 'addresses.id', '=', 'contacts.address_id')
                    ->leftJoin('nations', 'nations.id', '=', 'addresses.nation_id')
                    ->leftJoin('provinces', 'provinces.id', '=', 'addresses.province_id')
                    ->leftJoin('cities', 'cities.id', '=', 'addresses.city_id')
                    ->leftJoin('zips', 'zips.id', '=', 'addresses.zip_id');

                $operator = $this->getColumnSearchOperator('full_address');
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