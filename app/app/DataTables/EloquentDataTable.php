<?php

namespace App\DataTables;

use Yajra\DataTables\EloquentDataTable as BaseEloquentDataTable;
use Illuminate\Contracts\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Model;

abstract class EloquentDataTable extends BaseEloquentDataTable 
{
    use DataTableTrait {
        DataTableTrait::compileQuerySearch as extendedCompileQuerySearch;
    }

    /**
     * EloquentEngine constructor.
     *
     * @param  Model|EloquentBuilder  $model
     */
    public function __construct(Model|EloquentBuilder $model)
    {
        parent::__construct($model);
        $this->build();
        $this->setResultColumns();
        //$this->config->set('datatables.json.options', \JSON_NUMERIC_CHECK);
    }

    protected function compileQuerySearch($query, string $column, string|array $keyword, string $boolean = 'or', bool $nested = false, string $operator = 'like'): void
    {
        
        if (substr_count($column, '.') > 1) {
            $parts = explode('.', $column);
            $firstRelation = array_shift($parts);
            $column = implode('.', $parts);

            if ($this->isMorphRelation($firstRelation)) {
                $query->{$boolean.'WhereHasMorph'}(
                    $firstRelation,
                    '*',
                    function (EloquentBuilder $query) use ($column, $keyword, $operator, $nested) {
                        $this->extendedCompileQuerySearch($query, $column, $keyword, '', $nested, $operator);
                    }
                );
            } else {
                $query->{$boolean.'WhereHas'}($firstRelation, function (EloquentBuilder $query) use ($column, $keyword) {
                    self::compileQuerySearch($query, $column, $keyword, '', true);
                });
            }

            return;
        }

        $parts = explode('.', $column);
        $newColumn = array_pop($parts);
        $relation = implode('.', $parts);
        
        if (! $nested && $this->isNotEagerLoaded($relation)) {
            $this->extendedCompileQuerySearch($query, $column, $keyword, $boolean, false, $operator);

            return;
        }

        if ($this->isMorphRelation($relation)) {
            $query->{$boolean.'WhereHasMorph'}(
                $relation,
                '*',
                function (EloquentBuilder $query) use ($newColumn, $keyword, $operator) {
                    $this->extendedCompileQuerySearch($query, $newColumn, $keyword, '', $operator);
                }
            );
        } else {
            $query->{$boolean.'WhereHas'}($relation, function (EloquentBuilder $query) use ($newColumn, $keyword, $operator) {
                $this->extendedCompileQuerySearch($query, $newColumn, $keyword, '', $operator);
            });
        }
        
    }
}