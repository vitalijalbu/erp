<?php

namespace App\Models;

use App\Helpers\Utility;
use App\Models\Traits\HasCustomId;
use App\Models\Traits\PriceListUtils;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchasePriceList extends Model implements PriceListInterface
{
    use HasFactory, HasCustomId, PriceListUtils;

    protected $table = 'purchase_price_lists';

    public $timestamps = false;

    protected $guarded = [
        'company_id',
        'id'
    ];
    public $fillable = [
        'code',
        'currency_id',
        'bp_id'
    ];

    protected $casts = [
        'is_disabled' => 'boolean',
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::saved(function (PurchasePriceList $row) {
            $row = $row->refresh();
        });
    }

    /**
     * Get the company that owns the PurchasePriceList
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    /**
     * Get the currency that owns the PurchasePriceList
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id', 'id');
    }

    /**
     * Get the bp that owns the PurchasePriceList
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bp(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'bp_id', 'IDbp');
    }

    public function rows(): HasMany
    {
        return $this->hasMany(PurchasePriceListRow::class, 'purchase_price_list_id', 'id');
    }

    public static function exists($companyId, $data, $excludedId = null): Builder
    {
        return 
            PurchasePriceList::where([
                'company_id' => $companyId,
                'currency_id' => $data['currency_id'],
                'is_disabled' => false
            ])
            ->when(
                isset($data['bp_id']), 
                function($q) use ($data){
                    $q->where('bp_id', $data['bp_id']);
                },
                function($q){
                    $q->whereNull('bp_id');
                },
            )
            ->when($excludedId, function($q) use ($excludedId){
                $q->where('id', '<>', $excludedId);
            });
    }

    public function clone($data)
    {
        $this->loadMissing('rows');

        $clone = $this->replicate()->fill($data);

        $clone->save();

        $this->rows->chunk(100)->each(function($rows) use ($data, $clone) {
            $res = [];

            foreach($rows as $row){

                $clonedRow = $row->replicate();

                $mod = false;

                if(isset($data['rows'])){
                    foreach($data['rows'] as $reqRow){
                        if(isset($reqRow['item_group_id'])){
                            if($clonedRow->item_group_id == $reqRow['item_group_id']){
                                $mod = true;
                                $clonedRow->price = $this->recalculatePrice($clonedRow->price, $reqRow['price_change']);
                                break;
                            }
                        }else if(isset($reqRow['item_subfamily_id'])){
                            if($clonedRow->item_subfamily_id == $reqRow['item_subfamily_id']){
                                $mod = true;
                                $clonedRow->price = $this->recalculatePrice($clonedRow->price, $reqRow['price_change']);
                                break;
                            }
                        }
                    }

                    if(isset($data['price_change']) && !$mod){
                        $clonedRow->price = $this->recalculatePrice($clonedRow->price, $data['price_change']);
                    }
                }else{
                    if(isset($data['price_change'])){
                        $clonedRow->price = $this->recalculatePrice($clonedRow->price, $data['price_change']);
                    } 
                }

                if($row->currency_id != $data['currency_id']){
                    $clonedRow->price = Utility::priceConvert($clonedRow->price, $data['currency_id'], $data['rate']);
                }

                $clonedRow->purchase_price_list_id = $clone->id;

                $clonedRow->price = Utility::priceConvert($clonedRow->price, $data['currency_id']);

                $res[] = $clonedRow->toArray();
            }

            PurchasePriceListRow::insert($res);
        });

        $clone = $clone->refresh();
        
        return $clone;
    }

    private function recalculatePrice($price, $change)
    {
        return $price + $price * $change / 100;
    }

    public function changePrice($data)
    {
        $this->loadMissing('rows');

        $this->rows->chunk(100)->each(function($rows) use ($data) {
            foreach($rows as $row){
                $mod = false;

                if(isset($data['rows'])){
                    foreach($data['rows'] as $reqRow){
                        if(isset($reqRow['item_group_id'])){
                            if($row->item_group_id == $reqRow['item_group_id']){
                                $mod = true;
                                $row->price = $this->recalculatePrice($row->price, $reqRow['price_change']);
                                break;
                            }
                        }else if(isset($reqRow['item_subfamily_id'])){
                            if($row->item_subfamily_id == $reqRow['item_subfamily_id']){
                                $mod = true;
                                $row->price = $this->recalculatePrice($row->price, $reqRow['price_change']);
                                break;
                            }
                        }
                    }

                    if(isset($data['price_change']) && !$mod){
                        $row->price = $this->recalculatePrice($row->price, $data['price_change']);
                    }
                }else{
                    if(isset($data['price_change'])){
                        $row->price = $this->recalculatePrice($row->price, $data['price_change']);
                    } 
                }

                $row->price = Utility::priceConvert($row->price, $this->currency_id);

                $row->save();
            }
        });
    }
}
