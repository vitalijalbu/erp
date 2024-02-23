<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LotDimension extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'lot_dimension';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'IDlot',
        'IDcar',
        'val',
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

    /**
     * Get the lot that owns the LotDimension
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }
}
