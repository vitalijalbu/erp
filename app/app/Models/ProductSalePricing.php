<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class ProductSalePricing extends Model
{
    use HasFactory;

    use Traits\LogsActivity;

    protected $table = 'sale_pricing_constraint_standard_product';

    protected $primaryKey = 'id';

    public $incrementing = true;

    public $timestamps = false;

    public $fillable = [
        'position',
        'constraint_id',
        'standard_product_sale_pricing_group_id'
    ];

    protected static function booted(): void
    {
        static::saving(function (ProductSalePricing $rule) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save product price rule outside of a transaction");
            }

            if($rule->isDirty('position') || $rule->isDirty('standard_product_sale_pricing_group_id')) {

                $samePos = ProductSalePricing::where('standard_product_id', $rule->standard_product_id)
                    ->where('standard_product_sale_pricing_group_id', $rule->standard_product_sale_pricing_group_id)
                    ->where('position', $rule->position)
                    ->when($rule->id, function($q) use ($rule) {
                        $q->where('id', '<>', $rule->id);
                    })
                    ->exists();

                if($samePos) {
                    $rule->position++;
                }
                
                $next = ProductSalePricing::where('standard_product_id', $rule->standard_product_id)
                    ->where('standard_product_sale_pricing_group_id', $rule->standard_product_sale_pricing_group_id)
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

    public function salePricingGroup(): BelongsTo
    {
        return $this->belongsTo(StandardProductSalePricingGroup::class, 'standard_product_sale_pricing_group_id', 'id');
    }

}
