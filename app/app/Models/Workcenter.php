<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Workcenter extends Model
{
    use HasFactory;

    use HasCustomId;
    
    protected $table = 'workcenters';
    
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'name'
    ];

    protected $guarded = [
        'company_id'
    ];
    
    public $timestamps = false;

    /**
     * Get the company that owns the Workcenter
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }
}
