<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;


class WACYearLayer extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    
    protected $table = 'WAC_year_layers';
    
    protected $primaryKey = 'IDlayer';
    
    protected $fillable = [
        'IDcompany',
        'username',
        'date_calc',
        'year_layer',
        'definitive',
        'date_definitive'
    ];
    
    public $timestamps = false;

    protected static function booted(): void
    {
        parent::booted();

    }
    
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }
 
    public static function getAvailableYears($companyId): array
    {
        $definitiveLayers = static::query()
            ->lockForUpdate()
            ->select([DB::raw('distinct year_layer')])
            ->where('definitive', 1)
            ->where('IDcompany', $companyId)
            ->get()
            ->pluck('year_layer');


        $layerCount = static::query()
            ->lockForUpdate()
            ->where('IDcompany', $companyId)
            ->count();

        $latestLayer = static::query()
            ->lockForUpdate()
            ->where('IDcompany', $companyId)
            ->max('year_layer');

        return Transaction::query()
            ->lockForUpdate()
            ->select([DB::raw('distinct year(date_tran) as tr_year')])
            ->where('IDcompany', $companyId)
            ->where(DB::raw('year(date_tran)'), '<', date('Y')) //date is older than now
            ->whereNotIn( // not already in definitive layers
                DB::raw('year(date_tran)'), 
                $definitiveLayers
            )
            ->where(function (Builder $query) use ($definitiveLayers, $layerCount, $latestLayer) {
                $query
                    ->whereIn(DB::raw('year(date_tran) - 1'), $definitiveLayers) //or the previous year exists
                    ->orWhere(DB::raw($layerCount), 0); //or is the first
            })
            ->where(DB::raw('year(date_tran)'), '>', $latestLayer ?? 0) //the year is grather than the latest
            ->get()
            ->pluck('tr_year')
            ->sort()
            ->values()
            ->toArray();
            

    }

    public function scopeWithNotCheckedCount(Builder $query): void 
    {
        $query
            ->lockForUpdate()
            ->select([
            '*', 
            DB::raw("
                case when definitive = 1 then 0 when definitive = 0 then  
                (select COUNT(*)  
                from dbo.parView_WAC_ADD_LAY_stock_QtyValue_on_year_end(WAC_year_layers.IDcompany,WAC_year_layers.year_layer)
                where checked_value = 0)
                end as CountNotCheckedValue
            ")
        ]);
    }

    public function canBeDefinitive(): bool
    {
        if(!isset($this->CountNotCheckedValue)) {
            $this->CountNotCheckedValue = static::withNotCheckedCount()
                ->where('IDlayer', $this->IDlayer)
                ->first()
                ->CountNotCheckedValue;
        }

        return $this->CountNotCheckedValue == 0;
    }

    public static function addOrRecreate($companyId, $username, $year) 
    {
        DB::statement('exec dbo.sp_WAC_ADD_LAY_add_year_layer ?, ?, ?', [
            $companyId,
            $username,
            $year
        ]);
    }

    public function setDefinitive() 
    {
        DB::statement('exec dbo.sp_WAC_set_layer_definitive ?, ?', [
            $this->IDcompany,
            $this->year_layer,
        ]);
    }

    public static function transactionNotCheckedValueCount($companyId, \DateTimeInterface $start, \DateTimeInterface $end)
    {
        $lots = DB::query()
            ->select(['IDlot'])
            ->fromRaw('[dbo].[parView_WAC_stock_purchase_transaction] (?, ?, ?)', [
                $companyId,
                $start->format('Y-m-d H:i:s'),
                $end->format('Y-m-d H:i:s'),
            ])
            ->where('checked_value', 0)
            ->orderBy('IDlot')
            ->pluck('IDlot');

        return [
            'lots' => $lots,
            'count' => count($lots)
        ];
    }

}
