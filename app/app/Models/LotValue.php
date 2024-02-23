<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LotValue extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'lot_value';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'IDlot',
        'date_ins',
        'UnitValue',
        'username',
        'IDdevaluation',
        'note',
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

    /**
     * Get the devaluationHistory that owns the LotValue
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function devaluationHistory(): BelongsTo
    {
        return $this->belongsTo(DevaluationHistory::class, 'IDdevaluation', 'IDdevaluation');
    }
}
