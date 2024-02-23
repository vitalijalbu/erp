<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryLotHistory extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'inventory_lots_history';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'IDinventory',
        'IDlot',
        'qty',
        'invUsername',
        'invDate_ins',
        'IDwarehouse',
        'IDlocation',
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
     * Get the warehouse that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'IDwarehouse', 'IDwarehouse');
    }

    /**
     * Get the warehouseLocation that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function warehouseLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocation::class, 'IDlocation', 'IDlocation');
    }

    /**
     * Get the inventory that owns the InventoryLotHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'IDinventory', 'IDinventory');
    }

    /**
     * Get the lot that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }

    public static function getLotsByCompanyAndInventory($idCompany, $idInventory): builder
    {
        return 
            InventoryLotHistory::query()
                ->select('IDlot', 'qty', 'invUsername', DB::raw('substring(convert(varchar, invDate_ins, 20),1,16) as invDate_ins, dbo.getDimByLot (IDcompany, IDlot) as dim' ), 'IDwarehouse', 'IDlocation')
                ->whereHas('lot')
                ->whereHas('lot.item')
                ->whereHas('warehouse')
                ->whereHas('warehouseLocation')
                ->where([
                    'IDcompany' => $idCompany,
                    'IDinventory' => $idInventory 
                ])
                ->with([
                    'lot' => function($q){
                        $q->select('IDlot', 'IDitem')
                            ->selectRaw("substring(convert(varchar, date_lot, 20),1,10) as date_lot")
                            ->with('item', function($q){
                                $q->select('IDitem', 'item', 'item_desc', 'um');
                            });
                    },
                    'warehouse' => function($q){
                        $q->select('IDwarehouse', 'desc');
                    },
                    'warehouseLocation' => function($q){
                        $q->select('IDlocation','desc');
                    }
                ]);
    }
}
