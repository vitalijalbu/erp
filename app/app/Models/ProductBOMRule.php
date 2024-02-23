<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


class ProductBOMRule extends Model
{
    use Traits\LogsActivity;

    protected $table = 'bom_constraint_standard_product';

    protected $primaryKey = 'id';

    public $incrementing = true;

    public $timestamps = false;

    public $fillable = [
        'position',
        'constraint_id',
    ];


    protected static function booted(): void
    {
        static::saving(function (ProductBOMRule $rule) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save product bom rule outside of a transaction");
            }

            if($rule->isDirty('position')) {

                $samePos = ProductBOMRule::where('standard_product_id', $rule->standard_product_id)
                    ->where('position', $rule->position)
                    ->when($rule->id, function($q) use ($rule) {
                        $q->where('id', '<>', $rule->id);
                    })
                    ->exists();

                if($samePos) {
                    $rule->position++;
                }
                
                $next = ProductBOMRule::where('standard_product_id', $rule->standard_product_id)
                    ->where('position', '=', $rule->position)
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

    public function constraint(): BelongsTo
    {
        return $this->belongsTo(Constraint::class);
    }
    
}
