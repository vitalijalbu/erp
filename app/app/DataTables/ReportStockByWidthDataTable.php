<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportStockByWidthDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'warehouse' => [
                'data' => 'wdesc',
                'name' => 'wdesc',
                'searchable' => false,
                'orderable' => false
            ],
            'location' => [
                'data' => 'wldesc',
                'name' => 'wldesc',
                'searchable' => false,
                'orderable' => false
            ],
            'item' => [
                'data' => 'item',
                'name' => 'i.item',
                'searchable' => false,
                'orderable' => false

            ],
            'itemDesc' => [
                'data' => 'item_desc',
                'name' => 'i.item_desc',
                'searchable' => false,
                'orderable' => false
            ],
            'width' => [
                'data' => 'larghezza',
                'name' => 'larghezza',
                'searchable' => false,
                'orderable' => false
            ],
            'm2' => [
                'data' => 'm2',
                'name' => 'm2',
                'searchable' => false,
                'orderable' => false
            ],
        ];
    }

   
}