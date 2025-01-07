<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportCuttingWasteDataTable extends QueryDataTable {

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
        ];
    }


    protected function build(): static
    {
        return $this
        ->addColumn('wasteQty', function($r){
            return number_format(round($r->dad_qty_sr - $r->son_qty));
        })
        ->addColumn('wastePercentage', function($r){
            return number_format(round((1 - ($r->son_qty / $r->dad_qty_sr)) * 100));
        });
    }

   
}