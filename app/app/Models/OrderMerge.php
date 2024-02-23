<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderMerge extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'order_merge';
    
    protected $primaryKey = 'IDmerge';
    
    protected $fillable = [
        'IDcompany',
        'executed',
        'username',
        'IDlot_destination',
        'date_executed',
        'date_creation',
        'date_planned',
    ];
    
    public $timestamps = false;

    /**
     * Get all of the rowsPicking for the OrderMerge
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function rowsPicking(): HasMany
    {
        return $this->hasMany(OrderMergeRowsPicking::class, 'IDmerge', 'IDmerge');
    }
}
