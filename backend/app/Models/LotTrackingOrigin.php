<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LotTrackingOrigin extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'lot_tracking_origin';

    protected $primaryKey = 'IDtrack';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'IDlot',
        'IDlot_origin',
        'date_track',
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
     * Get the lot that owns the LotTrackingOrigin
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }
}
