<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportUnloadedItemDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'transType' => [
                'data' => 'ttdesc',
                'name' => 'ttdesc',
                'searchable' => false,
                'orderable' => false
            ],
            'item' => [
                'data' => 'item',
                'name' => 'item',
                'searchable' => false,
                'orderable' => false
            ],
            'itemDesc' => [
                'data' => 'item_desc',
                'name' => 'item_desc',
                'searchable' => false,
                'orderable' => false
            ],
            'um' => [
                'data' => 'um',
                'name' => 'um',
                'searchable' => false,
                'orderable' => false
            ],
            'unloadedQty' => [
                'data' => 'qtyUnload',
                'name' => 'qtyUnload',
                'searchable' => false,
                'orderable' => false
            ],
        ];
    }

   
}