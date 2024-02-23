<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemClassificationPivot extends Model
{
    use HasFactory;

    protected $table = 'item_classifications_pivot';

    // protected $primaryKey = 'id';

    // public $timestamps = false;

    // public $incremental = false;

    // public $keyType = 'string';

    /**
     * Get the parent that owns the ItemClassificationPivot
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ItemClassification::class, 'level_1_item_classification_id');
    }
}
