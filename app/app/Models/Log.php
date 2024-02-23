<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Log extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'logs';

    protected $primaryKey = 'IDerr';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'username',
        'date',
        'vars',
        'errors',
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
