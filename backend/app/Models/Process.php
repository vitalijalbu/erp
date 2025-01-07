<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

class Process extends Model
{
    use HasFactory, HasCustomId;

    protected $table = 'processes';

    protected $fillable = [
        'code',
        'name',
        'price_item_id',
        'setup_price_item_id',
        'operator_cost_item_id',
        'execution_time',
        'setup_time',
        'men_occupation',
        'need_machine'
    ];

    protected $casts = [
        'need_machine' => 'boolean'
    ];

    public $timestamps = false;

    public static function searchByDesc($search): Builder
    {
        $processes = static::where(function(Builder $q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%');
            })
            ->orderBy(DB::raw("
                CASE
                WHEN name LIKE ? THEN 1
                WHEN name LIKE ? THEN 2
                WHEN name LIKE ? THEN 4
                ELSE 3
                END"
        ));

        $processes->getQuery()
            ->addBinding($search, 'order')
            ->addBinding($search.'%', 'order')
            ->addBinding('%'.$search, 'order');

        return $processes;
    }

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('processes.company_id', $user->IDcompany);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }

    public function priceItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'price_item_id', 'IDitem');
    }

    public function setupPriceItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'setup_price_item_id', 'IDitem');
    }

    public function operatorCostItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'operator_cost_item_id', 'IDitem');
    }

    public function machines(): BelongsToMany
    {
        return $this->belongsToMany(Machine::class, null, 'process_id', 'machine_id')->using(ProcessMachine::class)->withPivot('workcenter_default');
    }

    public function getDefaultMachine($workcenterId): ?Machine
    {
        return $this->machines()->where('workcenter_id', $workcenterId)->wherePivot('workcenter_default', true)->first();
    }
}
