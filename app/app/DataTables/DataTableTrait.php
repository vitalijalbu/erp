<?php

namespace App\DataTables;

use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Contracts\Database\Eloquent\Builder as EloquentBuilder;

trait DataTableTrait
{
    protected ?array $schema = null;

    protected $allowedOperators = ['like', '=', '<', '>', '<=', '>=', '<>', '!=', 'between', 'in', 'notin'];

    abstract protected function setSchema(): array;

    protected function build(): static {
        return $this;
    }

    protected function getSchema(): array
    {
        if(!$this->schema) {
            $this->schema = $this->setSchema();
        }
        
        return $this->schema;
    }

    /**
     * Get column name to be use for filtering and sorting.
     *
     * @param  int|string  $index
     * @param  bool  $wantsAlias
     * @return string|null
     */
    public function getColumnName(int|string $index, bool $wantsAlias = false): ?string
    {
        $column = $this->getSchema()[$index]['name'] ?? null;

        if (is_null($column)) {
            return null;
        }

        // DataTables is using make(false)
        if (is_numeric($column)) {
            $column = $this->getColumnNameByIndex($index);
        }

        if (Str::contains(Str::upper($column), ' AS ')) {
            $column = \Yajra\DataTables\Utilities\Helper::extractColumnName($column, $wantsAlias);
        }

        return $column;
    }

    /**
     * Perform column search.
     *
     * @return void
     */
    public function columnSearch(): void
    {
        $columns = $this->getSchema();

        foreach ($columns as $index => $column) {
            $column = $this->getColumnName($index);

            if (is_null($column)) {
                continue;
            }
            
            if (! $this->isColumnSearchable($index) || $this->isBlacklisted($index) && ! $this->hasFilterColumn($index)) {
                continue;
            }
            
            if ($this->hasFilterColumn($index)) {
                $keyword = $this->columnKeyword($index);
                $this->applyFilterColumn($this->getBaseQueryBuilder(), $index, $keyword);
            } else {
                $column = $this->resolveRelationColumn($column);
                $keyword = $this->columnKeyword($index);
                $this->compileColumnSearch($index, $column, $keyword);
            }
        }
    }

    /**
     * Get column keyword to use for search.
     *
     * @param  int|string  $i
     * @param  bool  $raw
     * @return string
     */
    /*
    protected function getColumnSearchKeyword(int|string $i, bool $raw = false): string
    {
        $keyword = $this->columnKeyword($i);
        if ($raw || $this->isRegex($i)) {
            return $keyword;
        }
        return $keyword;
        //return $this->setupKeyword($keyword);
    }
*/

    /**
     * Compile queries for column search.
     *
     * @param  int|string  $i
     * @param  string  $column
     * @param  string  $keyword
     * @return void
     */
    protected function compileColumnSearch(int|string $i, string $column, string|array $keyword): void
    {
        if ($this->isRegex($i)) {
            $this->regexColumnSearch($column, $keyword);
        } else {
            $operator = $this->getColumnSearchOperator($i);
            $operator = in_array($operator, $this->allowedOperators) ? $operator : 'like';
            $this->compileQuerySearch($this->query, $column, $keyword, '', false, $operator);
        }
    }

    /**
     * Compile query builder where clause depending on configurations.
     *
     * @param  QueryBuilder|EloquentBuilder  $query
     * @param  string  $column
     * @param  string  $keyword
     * @param  string  $boolean
     * @param  string  $operator
     * @return void
     */
    protected function compileQuerySearch($query, string $column, string|array $keyword, string $boolean = 'or', bool $nested = false, string $operator = 'like'): void
    {
        $column = $this->addTablePrefix($query, $column);
        $column = $this->castColumn($column);
        
        switch($operator) {
            case 'like':
                if ($this->config->isCaseInsensitive()) {
                    $sql = 'LOWER('.$column.') LIKE ?';
                }
                else {
                    $sql = $column.' LIKE ?';
                }
                $params = [$this->prepareKeyword($keyword)];
                break;
            case '=':
            case '<':
            case '>':
            case '<=':
            case '>=':
            case '<>':
            case '!=':
                if ($this->config->isCaseInsensitive()) {
                    $sql = 'LOWER('.$column.') '.$operator.' ?';
                    $params = [Str::lower($keyword)];
                }
                else {
                    $sql = $column.' '.$operator.' ?';
                    $params = [$keyword];
                }
                break;
            case 'between':
                if(!isset($keyword['from']) || !isset($keyword['to'])) {
                    throw new \Exception('from and to values are mandatory for between search');
                }
                if ($this->config->isCaseInsensitive()) {
                    $sql = 'LOWER('.$column.') BEETWEEN ? AND ?';
                    $params = [Str::lower($keyword['from']), Str::lower($keyword['to'])];
                }
                else {
                    $sql = $column.' BEETWEEN ? AND ?';
                    $params = [$keyword['from'], $keyword['to']];
                }
                break;
            case 'in':
                if(!is_array($keyword)) {
                    throw new \Exception('search value must be an array');
                }
                if ($this->config->isCaseInsensitive()) {
                    $sql = 'LOWER('.$column.') IN ('. implode(', ', array_fill(0, count($keyword), '?')) .')';
                    $params = $keyword;
                }
                else {
                    $sql = $column.' IN ('. implode(', ', array_fill(0, count($keyword), '?')) .')';
                    $params = $keyword;
                }
                break;
            case 'notin':
                if(!is_array($keyword)) {
                    throw new \Exception('search value must be an array');
                }
                if ($this->config->isCaseInsensitive()) {
                    $sql = 'LOWER('.$column.') NOT IN ('. implode(', ', array_fill(0, count($keyword), '?')) .')';
                    $params = $keyword;
                }
                else {
                    $sql = $column.' NOT IN ('. implode(', ', array_fill(0, count($keyword), '?')) .')';
                    $params = $keyword;
                }
                break;
            default:
                throw new \Exception('Undefined operator '.$operator);
        }

        $query->{$boolean.'WhereRaw'}($sql, $params);
    }

    /**
     * Get column operator to use for search.
     *
     * @param  int|string  $i
     * @return string
     */
    public function getColumnSearchOperator(int|string $index): string
    {
        return $this->request->input("columns.$index.search.operator") ?? 'like'; 
    }

    /**
     * Check if DataTables must uses regular expressions.
     *
     * @param  int|string  $index
     * @return bool
     */
    public function isRegex(int|string $index): bool
    {
        return $this->request->input("columns.$index.search.regex") === 'true';
    }

    /**
     * Check if a column is searchable.
     *
     * @param  int|string  $i
     * @param  bool  $column_search
     * @return bool
     */
    public function isColumnSearchable(int|string $i, bool $column_search = true): bool
    {
        if ($column_search) {
            return
                ($this->getSchema()[$i]['searchable'] ?? false)
                && $this->columnKeyword($i) != '';
        }

        return $this->getSchema()[$i]['searchable'] ?? false;
    }

    /**
     * Get column's search value.
     *
     * @param  int|string  $index
     * @return string
     */
    public function columnKeyword(int|string $index): string|array
    {
        /** @var string $keyword */
        $keyword = $this->request->input("columns.$index.search.value") ?? '';
        
        return $this->prepareRequestKeyword($keyword);
    }

    /**
     * Prepare keyword string value.
     *
     * @param  float|array|int|string  $keyword
     * @return string
     */
    protected function prepareRequestKeyword(float|array|int|string $keyword)
    {
        if (is_array($keyword)) {
            /*
            //if the keyword array contains only 'from' and 'to' keys
            //means the search is a 'betweeen'
            if($keyword && !Arr::except($keyword, ['from', 'to'])) {
                return Arr::map(
                    Arr::only($keyword, ['from', 'to']),
                    fn($k) => (string)(is_array($k) ? implode(' ', $k) : $k)
                );
            }
            return implode(' ', $keyword);
            */
            return $keyword;
        }

        return (string) $keyword;
    }

    /**
     * Perform default query orderBy clause.
     *
     * @return void
     *
     * @throws \Psr\Container\ContainerExceptionInterface
     * @throws \Psr\Container\NotFoundExceptionInterface
     */
    protected function defaultOrdering(): void
    {
        collect($this->orderableColumns())
            ->map(function ($orderable) {
                $orderable['name'] = $this->getColumnName($orderable['column'], true);

                return $orderable;
            })
            ->reject(function ($orderable) {
                return $this->isBlacklisted($orderable['name']) && ! $this->hasOrderColumn($orderable['name']);
            })
            ->each(function ($orderable) {
                $column = $this->resolveRelationColumn($orderable['name']);

                if ($this->hasOrderColumn($orderable['name'])) {
                    $this->applyOrderColumn($orderable['name'], $orderable);
                } elseif ($this->hasOrderColumn($column)) {
                    $this->applyOrderColumn($column, $orderable);
                } else {
                    $nullsLastSql = $this->getNullsLastSql($column, $orderable['direction']);
                    $normalSql = $this->wrap($column).' '.$orderable['direction'];
                    $sql = $this->nullsLast ? $nullsLastSql : $normalSql;
                    $this->query->orderByRaw($sql);
                }
            });
    }

    /**
     * Get orderable columns.
     *
     * @return array
     */
    public function orderableColumns(): array
    {
        if (! $this->request->isOrderable()) {
            return [];
        }

        $orderable = [];
        for ($i = 0, $c = count((array) $this->request->input('order')); $i < $c; $i++) {
            /** @var int $order_col */
            $order_col = $this->request->input("order.$i.column");

            /** @var string $direction */
            $direction = $this->request->input("order.$i.dir");

            $order_dir = strtolower($direction) === 'asc' ? 'asc' : 'desc';
            if ($this->isColumnOrderable($order_col)) {
                $orderable[] = ['column' => $order_col, 'direction' => $order_dir];
            }
        }

        return $orderable;
    }

    /**
     * Check if a column is orderable.
     *
     * @param  int|string  $index
     * @return bool
     */
    public function isColumnOrderable(int|string $index): bool
    {
        return $this->getSchema()[$index]['orderable'] ?? false;
    }

    /**
     *  Set the default columns to return in the result
     * 
     *  @return void
     */
    protected function setResultColumns()
    {
        $columns = array_keys($this->getSchema());
        $appends = Arr::pluck($this->getColumnsDefinition()['append'] ?? [], 'name');
        $this->only([...$columns, ...$appends]);
    }

    /**
     * Get processed data.
     *
     * @param  iterable  $results
     * @param  bool  $object
     * @return array
     *
     * @throws \Exception
     */
    protected function processResults($results, $object = false): array
    {
        $processor = new Processors\DataProcessor(
            $results,
            $this->getColumnsDefinition(),
            $this->templates,
            $this->getSchema(),
            $this->request->start()
        );

        return $processor->process($object);
    }

    /**
     * Prepare query by executing count, filter, order and paginate.
     *
     * @return $this
     */
    public function prepareQuery($pagination = true): static
    {
        if (!$this->prepared) {
            $this->totalRecords = $this->totalCount();

            $this->filterRecords();
            $this->ordering();
            if($pagination){
                $this->paginate();
            } 
        }

        $this->prepared = true;

        return $this;
    }

    /**
     * Return the rows as array
     * 
     * @return \Illuminate\Support\Collection
     */
    public function getCollection($pag = true): \Illuminate\Support\Collection
    {
        return collect($this->processResults(
            $this->prepareQuery($pag)->results(), 
            true
        ));
    }

    /**
     * Get columns definition.
     *
     * @return array
     */
    public function getColumnsDefinition(): array
    {
        $config = (array) $this->config->get('datatables.columns');
        $allowed = ['excess', 'escape', 'raw', 'blacklist', 'whitelist'];

        return array_replace_recursive(Arr::only($config, $allowed), $this->columnDef);
    }

    public function exportAs($format, bool $pagination = false, string $exporter = null)
    {
        if(!$exporter) {
            $exporterClass = static::class; 
            if(str_ends_with($exporterClass, "DataTable")) {
                $exporterClass = preg_replace("/DataTable$/", "Export", $exporterClass);
                if(str_starts_with($exporterClass, "App\\DataTables")) {
                    $exporterClass = preg_replace("/^App\\\DataTables/", "App\\Exports", $exporterClass);
                }
                else {
                    $exporterClass = "App\\Exports\\" . array_pop(explode("\\", $exporterClass));
                }
            }
        }
        else {
            $exporterClass = $exporter;
        }
        $exporterClass = new $exporterClass($this);
        $exporterClass->setPaginating($pagination);

        return Excel::raw($exporterClass, $format);
    }

    
    /**
     * Apply filterColumn api search.
     *
     * @param  QueryBuilder  $query
     * @param  string  $columnName
     * @param  string  $keyword
     * @param  string  $boolean
     * @return void
     */
    protected function applyFilterColumn($query, string $columnName, string $keyword, string $boolean = 'and'): void
    {
        $query = $this->getBaseQueryBuilder($query);
        $callback = $this->columnDef['filter'][$columnName]['method'];

        if ($this->query instanceof EloquentBuilder) {
            $builder = $this->query->newModelInstance()->newQuery();
        } else {
            $builder = $this->query->newQuery();
        }

        $callback->bindTo($this)($builder, $keyword);

        /** @var \Illuminate\Database\Query\Builder $baseQueryBuilder */
        $baseQueryBuilder = $this->getBaseQueryBuilder($builder);
        $query->addNestedWhereQuery($baseQueryBuilder, $boolean);
    }

}