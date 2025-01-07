<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DevaluationHistory extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'devaluation_history';

    protected $primaryKey = 'IDdevaluation';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'date_dev',
        'username',
    ];

     /**
     * Get the company that owns the BpDestination
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the lotValue for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lotValue(): HasMany
    {
        return $this->hasMany(LotValue::class, 'IDdevaluation', 'IDdevaluation');
    }
}
