<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class LotValuesDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'id_lot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
                'searchable' => true,
                'orderable' => true
            ],
            'id_lot_supplier' => [
                'data' => 'IDlot_fornitore',
                'name' => 'IDlot_fornitore',
                'searchable' => true,
                'orderable' => true
            ],
            'id_item' => [
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
            'date_ins' => [
                'data' => 'date_ins',
                'name' => 'date_ins',
                'searchable' => true,
                'orderable' => true
            ],
            'date_lot' => [
                'data' => 'date_lot',
                'name' => 'date_lot',
                'searchable' => true,
                'orderable' => true

            ],
            'um' => [
                'data' => 'um',
                'name' => 'um',
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
            'bp_desc' => [
                'data' => 'bpdesc',
                'name' => 'bpdesc',
                'searchable' => true,
                'orderable' => true
            ],
            'unit_value' => [
                'data' => 'UnitValue',
                'name' => 'UnitValue',
                'searchable' => true,
                'orderable' => true
            ],
            'price_piece' => [
                'data' => 'price_piece',
                'name' => 'price_piece',
                'searchable' => true,
                'orderable' => true
            ],
            'tval' => [
                'data' => 'tval',
                'name' => 'tval',
                'searchable' => true,
                'orderable' => true
            ],
            'tot_stock' => [
                'data' => 'totStock',
                'name' => 'totStock',
                'searchable' => true,
                'orderable' => true
            ],
            'ord_rif' => [
                'data' => 'ord_rif',
                'name' => 'ord_rif',
                'searchable' => true,
                'orderable' => true
            ],
            'loaded_wh_desc' => [
                'data' => 'loadedWhDesc',
                'name' => 'loadedWhDesc',
                'searchable' => true,
                'orderable' => true
            ],
            'delivery_note' => [
                'data' => 'delivery_note',
                'name' => 'delivery_note',
                'searchable' => true,
                'orderable' => true
            ],
            'conf_item' => [
                'data' => 'conf_item',
                'name' => 'conf_item',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

}