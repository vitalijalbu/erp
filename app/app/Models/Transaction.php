<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'transactions';
    
    protected $primaryKey = 'IDtransaction';
    
    protected $fillable = [
        'IDcompany',
        'date_tran',
        'IDlot',
        'IDwarehouse',
        'IDlocation',
        'segno',
        'qty',
        'IDtrantype',
        'ord_rif',
        'username',
        'IDbp',
        'IDprodOrd',
    ];
    
    public $timestamps = false;

    public function transactionsType(): BelongsTo
    {
        return $this->belongsTo(TransactionsType::class, 'IDtrantype', 'IDtrantype');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'IDwarehouse', 'IDwarehouse');
    }

    public function warehouseLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocation::class, 'IDlocation', 'IDlocation');
    }

    public function BP(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'IDbp', 'IDbp');
    }
}
