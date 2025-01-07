<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class SaleTotalDiscountMatrixRowDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'position' => [
                'data' => 'position',
                'name' => 'position',
                'searchable' => true,
                'orderable' => true
            ],
            'bp_id' => [
                'data' => 'bp_id',
                'name' => 'bp_id',
                'searchable' => true,
                'orderable' => true
            ],
            'bp_group_id' => [
                'data' => 'bp_group_id',
                'name' => 'bp_group_id',
                'searchable' => true,
                'orderable' => true
            ],
            'item_id' => [
                'data' => 'item_id',
                'name' => 'item_id',
                'searchable' => true,
                'orderable' => true
            ],
            'item_group_id' => [
                'data' => 'item_group_id',
                'name' => 'item_group_id',
                'searchable' => true,
                'orderable' => true
            ],
            'item_subfamily_id' => [
                'data' => 'item_subfamily_id',
                'name' => 'item_subfamily_id',
                'searchable' => true,
                'orderable' => true
            ],
            'service_item_id' => [
                'data' => 'service_item_id',
                'name' => 'service_item_id',
                'searchable' => true,
                'orderable' => true
            ],
            'quantity' => [
                'data' => 'quantity',
                'name' => 'quantity',
                'searchable' => true,
                'orderable' => true
            ],
            'width' => [
                'data' => 'width',
                'name' => 'width',
                'searchable' => true,
                'orderable' => true
            ],
            'note' => [
                'data' => 'note',
                'name' => 'note',
                'searchable' => true,
                'orderable' => true
            ],
            'value' => [
                'data' => 'value',
                'name' => 'value',
                'searchable' => true,
                'orderable' => true
            ],
            'sale_total_discount_matrix_id' => [
                'data' => 'sale_total_discount_matrix_id',
                'name' => 'sale_total_discount_matrix_id',
                'searchable' => true,
                'orderable' => true
            ],
            'sale_total_discount_matrix_description' => [
                'data' => 'sale_total_discount_matrix.description',
                'name' => 'saleDiscountMatrix.description',
                'searchable' => true,
                'orderable' => true
            ],
            'is_disabled' => [
                'data' => 'is_disabled',
                'name' => 'is_disabled',
                'searchable' => true,
                'orderable' => true
            ],
            'item_desc' => [
                'data' => 'item.item_desc',
                'name' => 'item.item_desc',
                'searchable' => true,
                'orderable' => true
            ],
            'item_item' => [
                'data' => 'item.item',
                'name' => 'item.item',
                'searchable' => true,
                'orderable' => true
            ],
            'item_group' => [
                'data' => 'item_group.item_group',
                'name' => 'itemGroup.item_group',
                'searchable' => true,
                'orderable' => true
            ],
            'group_desc' => [
                'data' => 'item_group.group_desc',
                'name' => 'itemGroup.group_desc',
                'searchable' => true,
                'orderable' => true
            ],
            'item_subfamily_code' => [
                'data' => 'item_subfamily.code',
                'name' => 'itemSubfamily.code',
                'searchable' => true,
                'orderable' => true
            ],
            'item_subfamily_description' => [
                'data' => 'item_subfamily.description',
                'name' => 'itemSubfamily.description',
                'searchable' => true,
                'orderable' => true
            ],
            'service_item_desc' => [
                'data' => 'service_item.item_desc',
                'name' => 'serviceItem.item_desc',
                'searchable' => true,
                'orderable' => true
            ],
            'service_item_item' => [
                'data' => 'service_item.item',
                'name' => 'serviceItem.item',
                'searchable' => true,
                'orderable' => true
            ],
            'bp_desc' => [
                'data' => 'bp.desc',
                'name' => 'bp.desc',
                'searchable' => true,
                'orderable' => true
            ],
            'bp_group_name' => [
                'data' => 'bp_group.name',
                'name' => 'bpGroup.name',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

}