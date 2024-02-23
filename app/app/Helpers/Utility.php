<?php

namespace App\Helpers;

use App\Models\Currency;
use DateTime;
use DateTimeZone;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Arr;

class Utility {

    public static function convertDateFromTimezone($date, $timezone, $timezone_to, $format)
    {
		if (trim($date) =='') {return '';}
        
		return Carbon::parse($date, $timezone)->setTimezone($timezone_to)->format($format);
    }

	public static function dateToTimezone($date, $dstTimezone) : CarbonInterface
	{
		if($date instanceof CarbonInterface) {
			return $date->setTimezone($dstTimezone);
		}
		return CarbonImmutable::parse($date, 'UTC')->setTimezone($dstTimezone);
	}

	public static function dateToDB($date, $srcTimezone = null) : CarbonInterface
	{
		if($date instanceof CarbonInterface) {
			return $date->setTimezone('UTC');
		}
		return CarbonImmutable::parse($date, $srcTimezone)->setTimezone('UTC');
	}

	public static function userDateFromString($date): CarbonInterface
	{
		return CarbonImmutable::parse($date, auth()->user()->clientTimezoneDB);
	}

	public static function localizeNum($num, $round)
	{
		/*
			2020-06-12, tutte le espotazione CSV che contengono 
			numeri devono essere trattate con questa funzione
			per attivare la localizzazione su base utente
			(ad esempio in america i decimali saranno divisi con il punto)	
		*/
		$localiz_num = '';
		
		if (is_numeric($num)) {
			$localiz_num = round($num,  $round);			
			$localiz_num = str_replace('.', auth()->user()->decimal_symb, $localiz_num);	
		}
		else{
			$localiz_num = $num;
		}
		
		return $localiz_num;
	}

	public static function generateTimezones(): array
	{
		/* 2020-05-12
        recuperiamo le timezone supportate da PHP 
        per farle selezionare all'utente ... */
        static $regions = [
            DateTimeZone::AFRICA,
            DateTimeZone::AMERICA,
            //DateTimeZone::ANTARCTICA,
            //DateTimeZone::ASIA,
            //DateTimeZone::ATLANTIC,
            //DateTimeZone::AUSTRALIA,
            DateTimeZone::EUROPE,
            //DateTimeZone::INDIAN,
            //DateTimeZone::PACIFIC,
		];

        $timezones = [];
        
        foreach($regions as $region){
            $timezones = array_merge( $timezones, DateTimeZone::listIdentifiers( $region ) );
        }

        $timezoneOffsets = [];

        foreach( $timezones as $timezone ){
            $tz = new DateTimeZone($timezone);
            $timezoneOffsets[$timezone] = $tz->getOffset(new DateTime);
        }

        // sort timezone by offset
        asort($timezoneOffsets);

        $timezoneList = [];

        foreach( $timezoneOffsets as $timezone => $offset ){
            $offsetPrefix = $offset < 0 ? '-' : '+';
            $offsetFormatted = gmdate( 'H:i', abs($offset) );

            $prettyOffset = "UTC{$offsetPrefix}{$offsetFormatted}";

            $timezoneList[$timezone] = "({$prettyOffset}) $timezone";
        }

		return $timezoneList;
	}

	public static function priceConvert($price, $currency_id, $rate = null, float $rounding = null)
	{
		if(!$rounding){
			 $rounding = Currency::where('id', $currency_id)->firstOrFail()->rounding;
		}

		$rounding = log10(1 / $rounding);

		if($rate){
			$price *= $rate;
		}

		return round($price, $rounding);
	}
}