<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkingDaysRule extends Model
{
    use HasFactory;

    use HasCustomId;

    protected $casts = [
        'repeat' => 'boolean',
        'type' => 'boolean',
        'start' => 'date:Y-m-d',
        'end' => 'date:Y-m-d',
        'days_of_week' => 'json'
    ];

    public $timestamps = false;

    protected $table = 'working_days_rules';

    public $fillable = [
        'type',
        'start',
        'end',
        'days_of_week',
        'repeat',
        'note'
    ];

    protected $keyType = 'string';

    public $incrementing = false;

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('working_days_rules.company_id', $user->IDcompany);
    }
}
