<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemLine extends Model
{
    use HasFactory;

    use HasCustomId;

    protected $table = 'items_lines';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'company_id',
        'code',
        'description',
    ];

    /**
     * Get the company that owns the ItemLine
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }
}
