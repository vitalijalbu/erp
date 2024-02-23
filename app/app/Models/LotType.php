<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LotType extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    
    protected $table = 'lot_type';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'IDlotType',
        'desc',
    ];

    /**
     * Get the company that owns the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }
}
