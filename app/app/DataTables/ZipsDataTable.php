<?php

namespace App\DataTables;

class ZipsDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'zips.id',
                'searchable' => true,
                'orderable' => true
            ],
            'code' => [
                'data' => 'code',
                'name' => 'zips.code',
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
                'data' => 'city.nation',
                'name' => 'city.nation_id',
                'searchable' => true,
                'orderable' => true
            ],
            'province' => [
                'data' => 'city.province',
                'name' => 'city.province.code',
                'searchable' => true,
                'orderable' => true
            ],
            'province_id' => [
                'data' => 'city.province_id',
                'name' => 'city.province_id',
                'searchable' => true,
                'orderable' => true
            ],
            'city' => [
                'data' => 'city',
                'name' => 'city.name',
                'searchable' => true,
                'orderable' => true
            ],
            'city_id' => [
                'data' => 'city_id',
                'name' => 'city_id',
                'searchable' => true,
                'orderable' => true
            ],
            'description' => [
                'data' => 'description',
                'name' => 'zips.description',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }
}