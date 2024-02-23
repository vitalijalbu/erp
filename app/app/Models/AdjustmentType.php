<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdjustmentType extends Model
{
    use HasFactory;

    protected $table = 'adjustments_type';

    protected $primaryKey = 'IDadjtype';

    public $timestamps = false;

    public $fillable = [
        'desc',
        'inventory',
        'ordinamento'
    ];

    /**
     * Get all of the adjustmentHistories for the Warehouse
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function adjustmentHistories(): HasMany
    {
        return $this->hasMany(AdjustmentHistory::class, 'IDadjtype', 'IDadjtype');
    }

}
