<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class SalePriceListRowDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'order' => [
                'data' => 'order',
                'name' => 'order',
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
            'date_from' => [
                'data' => 'date_from',
                'name' => 'date_from',
                'searchable' => true,
                'orderable' => true
            ],
            'date_to' => [
                'data' => 'date_to',
                'name' => 'date_to',
                'searchable' => true,
                'orderable' => true
            ],
            'price' => [
                'data' => 'price',
                'name' => 'price',
                'searchable' => true,
                'orderable' => true
            ],
            'note' => [
                'data' => 'note',
                'name' => 'note',
                'searchable' => true,
                'orderable' => true
            ],
            'sales_price_list_id' => [
                'data' => 'sales_price_list_id',
                'name' => 'sales_price_list_id',
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
        ];
    }

}