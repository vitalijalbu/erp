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


class ProductConfigurationFeature extends Model
{
    use Traits\LogsActivity;

    protected $table = 'feature_standard_product';

    protected $primaryKey = 'id';

    public $incrementing = true;

    public $timestamps = false;

    public $fillable = [
        'standard_product_id',
        'feature_id',
        'readonly',
        'position',
        'hidden',
        'multiple',
        'main_product',
        'validation_constraint_id',
        'dataset_constraint_id',
        'activation_constraint_id',
        'value_constraint_id',
        'feature_attribute_id'
    ];


    protected static function booted(): void
    {
        static::saving(function (ProductConfigurationFeature $feature) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save product configuration feature outside of a transaction");
            }

            if($feature->isDirty('position')) {

                $samePos = ProductConfigurationFeature::where('standard_product_id', $feature->standard_product_id)
                    ->where('position', $feature->position)
                    ->when($feature->id, function($q) use ($feature) {
                        $q->where('id', '<>', $feature->id);
                    })
                    ->exists();

                if($samePos) {
                    $feature->position++;
                }
                
                $next = ProductConfigurationFeature::where('standard_product_id', $feature->standard_product_id)
                    ->where('position', '=', $feature->position)
                    ->first();
                    
                if($next) {
                    $next->position++;
                    $next->save();
                }
            }

            if($feature->main_product) {
                ProductConfigurationFeature::where('standard_product_id', $feature->standard_product_id)
                    ->update(['main_product' => false]);
            }
        });
    }

    public function feature(): BelongsTo
    {
        return $this->belongsTo(Feature::class);
    }

    public function standardProduct(): BelongsTo
    {
        return $this->belongsTo(StandardProduct::class);
    }

    public function featureAttribute(): BelongsTo
    {
        return $this->belongsTo(FeatureAttribute::class, 'feature_attribute_id', 'id');
    }
    
}
