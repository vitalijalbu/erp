<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BPGroup extends Model
{
    use HasFactory;

    use HasCustomId;

    protected $table = 'bp_groups';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'name',
    ];

    protected $guarded = [
        'company_id'
    ];

    /**
     * Get the company that owns the BPGroup
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(BPGroup::class, 'company_id', 'id');
    }
}
