<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeatureAttribute extends Model
{
    use HasFactory;

    protected $autoincrement = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'group',
        'position'
    ];

    protected $casts = [
        'multiple' => 'boolean'
    ];

    public function features(): HasMany
    {
        return $this->hasMany(ProductConfigurationFeature::class, 'feature_attribute_id', 'id');
    }
}
