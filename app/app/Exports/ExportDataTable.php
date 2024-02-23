<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;


abstract class ExportDataTable implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        protected \Yajra\DataTables\DataTableAbstract $dataTable,
        protected $paginating = false
    )
    {
        
    }

    public function setPaginating(bool $paginating): void
    {
        $this->paginating = $paginating;
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
    protected function defineMap($row): array
    {
        return $row;
    }

    public function collection()
    {
        return $this->dataTable->getCollection($this->paginating);
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
        $columns = $this->getDataTableColumns();

        return array_combine($columns, $columns);
    }

    protected function getDataTableColumns(): array
    {
        return $this->dataTable->getColumnsDefinition()['only'];
    }
}