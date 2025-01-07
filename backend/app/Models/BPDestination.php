<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BPDestination extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'bp_destinations';

    protected $primaryKey = 'IDdestination';

    public $timestamps = false;

    public $fillable = [
        'desc',
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
     * Get the user that owns the BpDestination
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bp(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'IDbp', 'IDbp');
    }

   
}
