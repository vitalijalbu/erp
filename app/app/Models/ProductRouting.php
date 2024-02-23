<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;


class ProductRouting extends Model
{
    use Traits\LogsActivity;

    protected $table = 'routing_constraint_standard_product';

    protected $primaryKey = 'id';

    public $incrementing = true;

    public $timestamps = false;

    public $fillable = [
        'process_id',
        'position',
        'activation_constraint_id',
        'workload_constraint_id',
    ];


    protected static function booted(): void
    {
        static::saving(function (ProductRouting $routing) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save product routing outside of a transaction");
            }

            if($routing->isDirty('position')) {

                $samePos = static::where('standard_product_id', $routing->standard_product_id)
                    ->where('position', $routing->position)
                    ->when($routing->id, function($q) use ($routing) {
                        $q->where('id', '<>', $routing->id);
                    })
                    ->exists();

                if($samePos) {
                    $routing->position++;
                }
                
                $next = static::where('standard_product_id', $routing->standard_product_id)
                    ->where('position', '=', $routing->position)
                    ->first();
                    
                if($next) {
                    $next->position++;
                    $next->save();
                }
            }
        });
    }

    public function standardProduct(): BelongsTo
    {
        return $this->belongsTo(StandardProduct::class);
    }

    public function process(): BelongsTo
    {
        return $this->belongsTo(Process::class);
    }

    public function activationConstraint(): BelongsTo
    {
        return $this->belongsTo(Constraint::class, 'activation_constraint_id');
    }

    public function workloadConstraint(): BelongsTo
    {
        return $this->belongsTo(Constraint::class, 'workload_constraint_id');
    }
    
}
