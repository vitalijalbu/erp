<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class PurchasePriceListDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'code' => [
                'data' => 'code',
                'name' => 'code',
                'searchable' => true,
                'orderable' => true
            ],
            'currency_id' => [
                'data' => 'currency_id',
                'name' => 'currency_id',
                'searchable' => true,
                'orderable' => true
            ],
            'bp_id' => [
                'data' => 'bp_id',
                'name' => 'bp_id',
                'searchable' => true,
                'orderable' => true
            ],
            'bp_desc' => [
                'data' => 'bp.desc',
                'name' => 'bp.desc',
                'searchable' => true,
                'orderable' => true
            ],
            'is_disabled' => [
                'data' => 'is_disabled',
                'name' => 'is_disabled',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

}