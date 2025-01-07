<?php

namespace App\DataTables;

use Illuminate\Contracts\Database\Eloquent\Builder;

class SaleSequenceDataTable extends EloquentDataTable {

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
            'current' => [
                'data' => 'current',
                'name' => 'current',
                'searchable' => true,
                'orderable' => true,
            ],
            'year' => [
                'data' => 'year',
                'name' => 'year',
                'searchable' => true,
                'orderable' => true,
            ],
            'prefix' => [
                'data' => 'prefix',
                'name' => 'prefix',
                'searchable' => true,
                'orderable' => true,
            ],
            'quotation_default' => [
                'data' => 'quotation_default',
                'name' => 'quotation_default',
                'searchable' => true,
                'orderable' => true,
            ],
            'sale_default' => [
                'data' => 'sale_default',
                'name' => 'sale_default',
                'searchable' => true,
                'orderable' => true,
            ],
        ];
    }

    
}