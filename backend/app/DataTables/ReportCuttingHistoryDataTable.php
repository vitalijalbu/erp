<?php

namespace App\DataTables;

use App\DataTables\EloquentDataTable;

class ReportCuttingHistoryDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'IDlot' => [
                'data' => 'IDlot',
                'name' => 'c.IDlot',
                'searchable' => false,
                'orderable' => false
            ],
            'chioCode' => [
                'data' => 'chio_code',
                'name' => 'chio_code',
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
        ];
    }

   
}