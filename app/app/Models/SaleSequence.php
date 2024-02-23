<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SaleSequence extends Model
{
    use HasFactory;

    use HasCustomId;

    protected $casts = [
        'quotation_default' => 'boolean',
        'sale_default' => 'boolean'
    ];

    public $timestamps = false;

    protected $table = 'sale_sequences';

    public $fillable = [
        'name',
        'prefix',
        'quotation_default',
        'sale_default',
    ];

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function booted(): void
    {
        static::saving(function (SaleSequence $sequence) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save sale sequence out of a transaction");
            }

            if($sequence->quotation_default || $sequence->sale_default) {
                $update = [];
                SaleSequence::when($sequence->quotation_default, function($q) use (&$update) {
                    $update['quotation_default'] = false;
                    $q->orWhere('quotation_default', true);
                })
                ->when($sequence->sale_default, function($q) use (&$update) {
                    $update['sale_default'] = false;
                    $q->orWhere('sale_default', true);
                })
                ->update($update);

            }
        });
    }

    public function getNextCode($year) {
        return DB::transaction(function() use ($year) {
            $sequence = static::where('id', $this->id)->sharedLock()->firstOrFail();
            if($sequence->year == $year) {
                $next = $sequence->current + 1;
            }
            else {
                $next = 1;
                $sequence->year = $year;
            }
            
            $sequence->current = $next;
            if(!$sequence->saveQuietly()) {
                abort(500);
            }

            $this->refresh();

            return $next;
        });
    }

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('sale_sequences.company_id', $user->IDcompany);
    }
}
