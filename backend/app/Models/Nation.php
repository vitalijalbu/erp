<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Nation extends Model
{
    use HasFactory;

    protected $table = 'nations';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $timestamps = false;

    public $fillable = [
        'id',
        'name',
        'iso_alpha_3'
    ];

    public $incrementing = false;

    public function provinces(): HasMany
    {
        return $this->hasMany(Province::class, 'nation_id', 'id');
    }
}
