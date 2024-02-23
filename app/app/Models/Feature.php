<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Feature extends Model
{
    use HasFactory;
    use Traits\LogsActivity;

    protected $table = 'features';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    public $fillable = [
        'id',
        'label',
        'feature_type_id',
    ];

    public function featureType(): BelongsTo
    {
        return $this->belongsTo(FeatureType::class, 'feature_type_id', 'id');
    }
    
}
