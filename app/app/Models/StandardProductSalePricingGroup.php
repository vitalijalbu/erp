<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class StandardProductSalePricingGroup extends Model
{
    use HasFactory;

    public $timestamps = false;

    public $fillable = [
        'position',
        'name',
    ];

    protected static function booted(): void
    {
        static::saving(function (StandardProductSalePricingGroup $group) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save pricing group outside of a transaction");
            }

            if($group->isDirty('position')) {

                $samePos = StandardProductSalePricingGroup::where('standard_product_id', $group->standard_product_id)
                    ->where('position', $group->position)
                    ->when($group->id, function($q) use ($group) {
                        $q->where('id', '<>', $group->id);
                    })
                    ->exists();

                if($samePos) {
                    $group->position++;
                }
                
                $next = StandardProductSalePricingGroup::where('standard_product_id', $group->standard_product_id)
                    ->where('position', '=', $group->position)
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

    public function constraints(): HasMany
    {
        return $this->hasMany(ProductSalePricing::class, 'standard_product_sale_pricing_group_id', 'id');
    }

}
