<?php

namespace App\DataTables\Processors;

use Illuminate\Support\Str;
use Illuminate\Support\Arr;

class DataProcessor extends \Yajra\DataTables\Processors\DataProcessor
{

    protected $schema = [];

    public function __construct($results, array $columnDef, array $templates, array $schema, int $start = 0)
    {
        $this->schema = $schema;
        parent::__construct($results, $columnDef, $templates, $start);
    }

    /**
     * Process data to output on browser.
     *
     * @param  bool  $object
     * @return array
     */
    public function process($object = false): array
    {
        $this->output = [];
        $indexColumn = config('datatables.index_column', 'DT_RowIndex');

        foreach ($this->results as $row) {
            $data =  \Yajra\DataTables\Utilities\Helper::convertToArray($row, ['hidden' => $this->makeHidden, 'visible' => $this->makeVisible]);
            $value = $this->prepareColumns($data);
            $value = $this->addColumns($value, $row);
            $value = $this->editColumns($value, $row);
            $value = $this->setupRowVariables($value, $row);
            $value = $this->selectOnlyNeededColumns($value);
            $value = $this->removeExcessColumns($value);

            if ($this->includeIndex) {
                $value[$indexColumn] = ++$this->start;
            }

            $this->output[] = $object ? $value : $this->flatten($value);
        }

        return $this->output;
    }

    protected function prepareColumns(array $data): array
    {
        $results = [];
        foreach ($this->schema as $columnName => $column) {
            Arr::set($results, $columnName, Arr::get($data, $column['data']));
        }

        return $results;
    }

    
}