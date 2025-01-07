<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CuttingOrder extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'cutting_order';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'IDlot',
        'executed',
        'date_executed',
        'username',
        'date_creation',
        'date_planned',
    ];

    /**
     * Get the company that owns the CuttingOrder
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }
}
