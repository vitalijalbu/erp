<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class StocksDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'idStock' => [
                'data' => 'IDstock',
                'name' => 'IDstock',
            ],
            'id_lot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
                'searchable' => true,
                'orderable' => true
            ],
            'id_inventory' => [
                'data' => 'IDinventory',
                'name' => 'IDinventory',
                'searchable' => true,
                'orderable' => true
            ],
            'id_lot_origine' => [
                'data' => 'IDlot_origine',
                'name' => 'IDlot_origine',
                'searchable' => true,
                'orderable' => true
            ],
            'id_item' => [
                'data' => 'IDitem',
                'name' => 'IDitem',
                'searchable' => true,
                'orderable' => true

            ],
            'item_code' => [
                'data' => 'item',
                'name' => 'item',
                'searchable' => true,
                'orderable' => true

            ],
            'item_desc' => [
                'data' => 'item_desc',
                'name' => 'item_desc',
                'searchable' => true,
                'orderable' => true

            ],
            'warehouse' => [
                'data' => 'whdesc',
                'name' => 'whdesc',
                'searchable' => true,
                'orderable' => true
            ],
            'warehouse_location' => [
                'data' => 'lcdesc',
                'name' => 'lcdesc',
                'searchable' => true,
                'orderable' => true

            ],
            'warehouse_id' => [
                'data' => 'IDwarehouse',
                'name' => 'IDwarehouse',
                'searchable' => true,
                'orderable' => true
            ],
            'warehouse_location_id' => [
                'data' => 'IDlocation',
                'name' => 'IDlocation',
                'searchable' => true,
                'orderable' => true
            ],
            'la' => [
                'data' => 'LA',
                'name' => 'LA',
                'searchable' => true,
                'orderable' => true

            ],
            'lu' => [
                'data' => 'LU',
                'name' => 'LU',
                'searchable' => true,
                'orderable' => true

            ],
            'pz' => [
                'data' => 'PZ',
                'name' => 'PZ',
                'searchable' => true,
                'orderable' => true

            ],
            'de' => [
                'data' => 'DE',
                'name' => 'DE',
                'searchable' => true,
                'orderable' => true

            ],
            'di' => [
                'data' => 'DI',
                'name' => 'DI',
                'searchable' => true,
                'orderable' => true
            ],
            'cutNum' => [
                'data' => 'cutNum',
                'name' => 'cutNum',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_stock' => [
                'data' => 'qty_stock',
                'name' => 'qty_stock',
                'searchable' => true,
                'orderable' => true
            ],
            'item_um' => [
                'data' => 'um',
                'name' => 'um',
                'searchable' => true,
                'orderable' => true
            ],
            'date_lot' => [
                'data' => 'date_lot',
                'name' => 'date_lot',
                'searchable' => true,
                'orderable' => true
            ],
            'lot_ori_year' => [
                'data' => 'lotOriYear',
                'name' => 'lotOriYear',
                'searchable' => true,
                'orderable' => true
            ],
            'step_roll' => [
                'data' => 'stepRoll',
                'name' => 'stepRoll',
                'searchable' => true,
                'orderable' => true
            ],
            'lot_ord_rif' => [
                'data' => 'ord_rif',
                'name' => 'ord_rif',
                'searchable' => true,
                'orderable' => true
            ],
            'eur1' => [
                'data' => 'eur1',
                'name' => 'eur1',
                'searchable' => true,
                'orderable' => true
            ],
            'conf_item' => [
                'data' => 'conf_item',
                'name' => 'conf_item',
                'searchable' => true,
                'orderable' => true
            ],
            'merged_lot' => [
                'data' => 'merged_lot',
                'name' => 'merged_lot',
                'searchable' => true,
                'orderable' => true
            ],
            'altv_code' => [
                'data' => 'altv_code',
                'name' => 'altv_code',
                'searchable' => false,
                'orderable' => false
            ],
            'altv_desc' => [
                'data' => 'altv_desc',
                'name' => 'altv_desc',
                'searchable' => false,
                'orderable' => false
            ],
            'numComp' => [
                'data' => 'NumComp',
                'name' => 'NumComp',
                'searchable' => false,
                'orderable' => false
            ], 
            'note' => [
                'data' => 'note',
                'name' => 'note',
                'searchable' => false,
                'orderable' => false
            ],                  
        ];
    }
}