<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemClassification extends Model
{
    use HasFactory;

    protected $table = 'item_classifications';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $incremental = false;

    public $keyType = 'string';

    public $fillable = [
        'id',
        'label',
        'level',
        'allow_owner',
        'require_level_2'
    ];

    /**
     * Get all of the pivot for the ItemClassification
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function pivot(): HasMany
    {
        return $this->hasMany(ItemClassificationPivot::class, 'level_1_item_classification_id', 'id');
    }


}
