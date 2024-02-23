<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UmDimension extends Model
{
    use HasFactory;

    protected $table = 'um_dimension';
    
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'IDcar',
        'IDdim',
        'Ordinamento',
        'umdesc',
        'um',
        'umdescs',
    ];
    
    public $timestamps = false;

    public function um(): BelongsTo
    {
        return $this->belongsTo(Um::class, 'IDdim', 'IDdim');
    }
}
