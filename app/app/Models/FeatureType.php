<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class FeatureType extends Model
{
    use HasFactory;

    protected $table = 'feature_types';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    public $fillable = [
        'id',
        'label',
    ];

    public function features(): HasMany
    {
        return $this->hasMany(Feature::class, 'feature_type_id', 'id');
    }
}
