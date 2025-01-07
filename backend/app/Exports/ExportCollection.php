<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Facades\Excel;

abstract class ExportCollection implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        protected $collection
    )
    {
        
    }

    public function map($row): array
    {
        $headers = $this->defineHeader();
        $rowData = $this->defineMap($row);
        
        return array_intersect_key($rowData, $headers);
    }

    /**
     * define the format of the row
     * override this function only if the columns must be edited or
     * some calculated columns shoud be added
     * 
     */
    protected function defineMap($row): \ArrayAccess|array
    {
        return (array)$row;
    }

    public function collection()
    {
        return $this->collection;
    }

    public function headings(): array
    {
        return $this->defineHeader();
    }

    /**
     * define the exported file header
     * the headers must be defined ad an array of columns
     * with the code of the columns as key and the label as value
     *  
     */
    protected function defineHeader(): array
    {
        $columns = $this->getColumns();

        return array_combine($columns, $columns);
    }

    protected function getColumns(): array
    {
        return array_keys($this->collection()[0]);
    }

    public function exportAs($format)
    {
        return Excel::raw($this, $format);
    }
}