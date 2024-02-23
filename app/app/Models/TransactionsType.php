<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionsType extends Model
{
    use HasFactory;

    protected $table = 'transactions_type';
    
    protected $primaryKey = 'IDtrantype';
    
    protected $fillable = [
        'IDtrantype',
        'desc',
    ];
    
    public $timestamps = false;
    
    public function transactions(): HasMany
    {
        return $this->HasMany(Transaction::class, 'IDtrantype', 'IDtrantype');
    }
}
