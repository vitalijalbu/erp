<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class ConstraintSubtype extends Model
{
    use HasFactory;

    protected $table = 'constraint_subtypes';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    public $fillable = [
        'id',
        'label',
        'constraint_type_id'
    ];


    public function constraintTypes(): BelongsTo
    {
        return $this->belongsTo(ConstraintType::class, 'constraint_type_id', 'id');
    }
}
