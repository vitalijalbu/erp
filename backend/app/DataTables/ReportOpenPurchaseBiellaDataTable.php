<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportOpenPurchaseBiellaDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'salesOrder' => [
                'data' => 't_orno',
                'name' => 't_orno',
                'searchable' => true,
                'orderable' => false
            ],
            'refOrder' => [
                'data' => 'ord_bp_row',
                'name' => 'ord_bp_row',
                'searchable' => true,
                'orderable' => false
            ],
            'item' => [
                'data' => 'item_std',
                'name' => 'item_std',
                'searchable' => true,
                'orderable' => false

            ],
            'cfg' => [
                'data' => 'cfg',
                'name' => 'cfg',
                'searchable' => false,
                'orderable' => false

            ],
            'lUm' => [
                'data' => 'UM_LN',
                'name' => 'UM_LN',
                'searchable' => false,
                'orderable' => false

            ],
            'cUm' => [
                'data' => 'UM_CSM',
                'name' => 'UM_CSM',
                'searchable' => false,
                'orderable' => false

            ],
            'qty' => [
                'data' => 't_qoor',
                'name' => 't_qoor',
                'searchable' => false,
                'orderable' => false

            ],
            'w' => [
                'data' => 'LA',
                'name' => 'LA',
                'searchable' => false,
                'orderable' => false

            ],
            'l' => [
                'data' => 'LU',
                'name' => 'LU',
                'searchable' => false,
                'orderable' => false

            ],
            'p' => [
                'data' => 'PZ',
                'name' => 'PZ',
                'searchable' => false,
                'orderable' => false

            ],
            'e' => [
                'data' => 'DE',
                'name' => 'DE',
                'searchable' => false,
                'orderable' => false

            ],
            'i' => [
                'data' => 'DI',
                'name' => 'DI',
                'searchable' => false,
                'orderable' => false

            ],
            'dateIns' => [
                'data' => 't_prdt_c',
                'name' => 't_prdt_c',
                'searchable' => true,
                'orderable' => false
            ],
            'datePlan' => [
                'data' => 'planned_date',
                'name' => 'planned_date',
                'searchable' => true,
                'orderable' => false
            ],
            'lBox' => [
                'data' => 'boxed_qty_UM_LN',
                'name' => 'boxed_qty_UM_LN',
                'searchable' => false,
                'orderable' => false

            ],
            'lShp' => [
                'data' => 'shipping_qty_UM_LN',
                'name' => 'shipping_qty_UM_LN',
                'searchable' => false,
                'orderable' => false

            ],
            'lDel' => [
                'data' => 'delivered_qty_UM_LN',
                'name' => 'delivered_qty_UM_LN',
                'searchable' => false,
                'orderable' => false

            ],
            'lLft' => [
                'data' => 'leftovery_UM_LN',
                'name' => 'leftovery_UM_LN',
                'searchable' => false,
                'orderable' => false

            ],
            'cBox' => [
                'data' => 'boxed_qty_UM_CSM',
                'name' => 'boxed_qty_UM_CSM',
                'searchable' => false,
                'orderable' => false

            ],
            'cShp' => [
                'data' => 'shipping_qty_UM_CSM',
                'name' => 'shipping_qty_UM_CSM',
                'searchable' => false,
                'orderable' => false

            ],
            'cDel' => [
                'data' => 'delivered_qty_UM_CSM',
                'name' => 'delivered_qty_UM_CSM',
                'searchable' => false,
                'orderable' => false

            ],
            'cLft' => [
                'data' => 'leftovery_UM_CSM',
                'name' => 'leftovery_UM_CSM',
                'searchable' => false,
                'orderable' => false

            ],
        ];
    }
}