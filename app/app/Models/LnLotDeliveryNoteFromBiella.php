<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LnLotDeliveryNoteFromBiella extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'zETL_LN_lots_delivery_notes_from_biella';

    protected $primaryKey = 'IDrecord';

    public $timestamps = false;

    /**
     * Get the company that owns the LnLotDeliveryNoteFromBiella
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }
}
