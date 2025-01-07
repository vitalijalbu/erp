<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Inventory extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'inventory';

    protected $primaryKey = 'IDinventory';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'desc',
        'completed',
        'start_date',
        'end_date',
        'username',
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

    /**
     * Get all of the adjustmentHistories for the Warehouse
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function adjustmentHistories(): HasMany
    {
        return $this->hasMany(AdjustmentHistory::class, 'IDinventory', 'IDinventory');
    }

    //restituisce l'id dell'inventario se attivo altrimenti NULL
    public static function getCodeCurrentlyRunning($id_company)
    {
        $i = Inventory::select('IDinventory')
                ->where([
                    'completed' => 0,
                    'IDcompany' => $id_company
                ])
                ->first();
        
        return $i ? $i->IDinventory : null;
    }
}