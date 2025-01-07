<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class ItemGroup extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'item_group';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'item_group',
        'group_desc',
        'IDcompany',
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

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('IDcompany', $user->IDcompany);
    }

    public function scopeWithShared(Builder $query): void 
    {
        $query->orWhere('IDcompany', 0);
    }
}
