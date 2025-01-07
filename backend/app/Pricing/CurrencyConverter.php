<?php

namespace App\Pricing;

use App\Models\Company;
use App\Models\Currency;
use App\Models\ExchangeRate;

class CurrencyConverter
{
    protected static $lru = [
        'rates' => [],
        'currencies' => []
    ];

    public static function convert(Company $company, $value, string|Currency $from = null, string|Currency $to = null)
    {
        if(!$from) {
            $from = $company->curr;
        }
        if(!$to) {
            $to = $company->curr;
        }
        $from = $from instanceof Currency ? $from : static::getCurrency($from);
        $to = $to instanceof Currency ? $to : static::getCurrency($to);

        if($from->id == $to->id) {
            return $value;
        }

        $rate = static::getRate($company->IDcompany, $from->id, $to->id);
        

        if(!$rate && $from->id == $company->curr) {
            throw new \Exception(sprintf("Cannot find a valid exchange rate for company %s from %s to %s", $company->IDcompany, $from->id, $to->id));
        }

        if($rate) {
            $value = $value * $rate->rate;
        }
        else {
            $rate = static::getRate($company->IDcompany, $company->curr, $from->id);

            if(!$rate && $from->id == $company->curr) {
                throw new \Exception(sprintf("Cannot find a valid exchange rate for company %s from %s to %s", $company->IDcompany, $from->id, $to->id));
            }
            
            $value = $value / $rate->rate;
            $value = $to->id == $company->curr ? $value : static::convert($company, $value, $company->curr, $to->id);
        }

        return $to->detailedRound($value);
    }

    protected static function getCurrency($id)
    {
        if(!isset(static::$lru['currencies'][$id])) {
            $currency = Currency::findOrFail($id);
            static::$lru['currencies'][$id] = $currency;
        }

        return static::$lru['currencies'][$id];
    }

    protected static function getRate($companyId, $companyRate, $foreignRate)
    {
        if(!array_key_exists($companyId.'_'.$companyRate.'_'.$foreignRate, static::$lru['rates'])) {
            $rate = ExchangeRate::where('company_id', $companyId)
                ->where('company_currency_id', $companyRate)
                ->where('foreign_currency_id', $foreignRate)
                ->orderByDesc('date')
                ->first();
            static::$lru['rates'][$companyId.'_'.$companyRate.'_'.$foreignRate] = $rate;
        }

        return static::$lru['rates'][$companyId.'_'.$companyRate.'_'.$foreignRate];
    }

}