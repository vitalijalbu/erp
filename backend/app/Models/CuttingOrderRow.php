<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CuttingOrderRow extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'cutting_order_row';

    protected $primaryKey = 'IDcut';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'IDlot',
        'PZ',
        'LA',
        'LU',
        'IDlot_new',
        'ord_rif',
        'step_roll_order',
        'step_roll',
        'IDlocation',
    ];

    /**
     * Get the company that owns the CuttingOrder
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
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
     * Get the lot that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }

    public static function getCutsByLotAndCompany($lot, $idCompany)
    {
        return 
            CuttingOrderRow::query()
                ->selectRaw("LA,LU,PZ,(LA*LU*PZ/1000000) as m2, ord_rif, IDcut, step_roll_order, step_roll, executed, IDlot_new, IDlocation")
                ->join('cutting_order', function($q){
                    $q->on('cutting_order.IDcompany', '=', 'cutting_order_row.IDcompany');
                    $q->on('cutting_order.IDlot', '=', 'cutting_order_row.IDlot');
                })
                ->whereHas('warehouseLocation')
                ->where([
                    'cutting_order_row.IDlot' => $lot,
                    'cutting_order_row.IDcompany' => $idCompany
                ])
                ->with('warehouseLocation')
                ->orderByDesc('step_roll')
                ->orderBy('step_roll_order')
                ->orderBy('IDcut');
    }
}


