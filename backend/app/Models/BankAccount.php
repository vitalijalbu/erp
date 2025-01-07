<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BankAccount extends Model
{
    use HasFactory;

    use HasCustomId;

    protected $table = 'bank_accounts';

    public $timestamps = false;

    public $fillable = [
        'name',
        'address_id',
        'swift_code',
        'iban',
        'bp_id',
        'company_id',
    ];

    /**
     * Get the bp that owns the BankAccount
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bp(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'bp_id', 'IDbp');
    }

    /**
     * Get the address that owns the BankAccount
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'address_id');
    }
}
