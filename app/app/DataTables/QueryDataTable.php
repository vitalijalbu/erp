<?php

namespace App\DataTables;

use Yajra\DataTables\QueryDataTable as BaseQueryDataTable;
use Illuminate\Contracts\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\JsonResponse;

abstract class QueryDataTable extends BaseQueryDataTable 
{
    use DataTableTrait;

    /**
     * @param  QueryBuilder  $builder
     */
    public function __construct(QueryBuilder $builder)
    {
        parent::__construct($builder);
        $this->build();
        $this->setResultColumns();
        //$this->config->set('datatables.json.options', \JSON_NUMERIC_CHECK);
    }

    /**
     * Organizes works.
     *
     * @param  bool  $mDataSupport
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception
     */
    public function make($mDataSupport = true): JsonResponse
    {
        $results = $this->prepareQuery()->results();
        $processed = $this->processResults($results, $mDataSupport);
        $data = $this->transform($results, $processed);

        return $this->render($data);
    }
}