<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class ConstraintType extends Model
{
    use HasFactory;

    protected $table = 'constraint_types';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    public $fillable = [
        'id',
        'label',
        'require_subtype'
    ];

    protected $casts = [
        'require_subtype' => 'boolean'
    ];


    public function constraints(): HasMany
    {
        return $this->hasMany(Constraint::class, 'constraint_type_id', 'id');
    }

    public function constraintSubtypes(): HasMany
    {
        return $this->hasMany(ConstraintSubtype::class, 'constraint_type_id', 'id');
    }
}
