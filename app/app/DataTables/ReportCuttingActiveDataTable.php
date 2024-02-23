<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportCuttingActiveDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'lot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
                'searchable' => true,
                'orderable' => false
            ],
            'item' => [
                'data' => 'item',
                'name' => 'item',
                'searchable' => true,
                'orderable' => false
            ],
            'itemDesc' => [
                'data' => 'item_desc',
                'name' => 'item_desc',
                'searchable' => false,
                'orderable' => false

            ],
            'dataExec' => [
                'data' => 'data_exec',
                'name' => 'data_exec',
                'searchable' => false,
                'orderable' => false
            ],
            'username' => [
                'data' => 'username',
                'name' => 'username',
                'searchable' => false,
                'orderable' => false
            ],
            'usedQty' => [
                'data' => 'dad_qty_sr',
                'name' => 'dad_qty_sr',
                'searchable' => false,
                'orderable' => false
            ],
            'receivedQty' => [
                'data' => 'son_qty',
                'name' => 'son_qty',
                'searchable' => false,
                'orderable' => false
            ],
            'wasteQty' => [
                'data' => 'wasteQty',
                'name' => 'wasteQty',
                'searchable' => false,
                'orderable' => false
            ],
            'wastePercentage' => [
                'data' => 'wastePercentage',
                'name' => 'wastePercentage',
                'searchable' => false,
                'orderable' => false
            ],
        ];
    }

   
}