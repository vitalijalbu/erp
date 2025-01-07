<?php

namespace App\Models\Traits;

use Carbon\Carbon;

trait checkOverlappingDates {

    public static function checkOverlappingDates($companyId, $data, $excludedId = null)
    {
        $dateFrom = $dateTo = null;

        if(isset($data['date_from'])){
            $dateFrom = Carbon::parse($data['date_from']);
        } 

        if(isset($data['date_to'])){
            $dateTo = Carbon::parse($data['date_to']);
        }
        
        if(!$dateTo && !$dateFrom){
            return null;
        }

        $message = [];

        static::exists($companyId, $data, $excludedId)->get()->each(function($el) use($dateFrom, $dateTo, &$message){     
            $dateFromDb = $dateToDb = null;   
            
            if($el->date_from){
                $dateFromDb = Carbon::parse($el->date_from);
            }

            if($el->date_to){
                $dateToDb = Carbon::parse($el->date_to);
            }

            if($dateFromDb && !$dateToDb){
                if($dateFrom){
                    if($dateFrom->gte($dateFromDb)){
                        $message[] = ['key' => 'date_from', 'message' => sprintf('The date from cannot be grater than %s',  $dateFromDb->format('Y-m-d'))];
                    }
                }

                if($dateTo){
                    if($dateTo->gte($dateFromDb)){
                        $message[] = ['key' => 'date_to', 'message' => sprintf('The date to cannot be grater than %s', $dateFromDb->format('Y-m-d'))];
                    }
                }
            }

            if(!$dateFromDb && $dateToDb){
                if($dateFrom){
                    if($dateFrom->lte($dateToDb)){
                        $message[] = ['key' => 'date_from', 'message' => sprintf('The date from cannot be less than %s', $dateToDb->format('Y-m-d'))];
                    }
                }

                if($dateTo){
                    if($dateTo->lte($dateToDb)){
                        $message[] = ['key' => 'date_to', 'message' => sprintf('The date to cannot be less than %s', $dateToDb->format('Y-m-d'))];
                    }
                }
            }

            if($dateFromDb && $dateToDb){
                if($dateFrom){
                    if($dateFrom->gte($dateFromDb)){
                        $message[] = ['key' => 'date_from', 'message' => "The dates entered overlap with others already entered"];
                    }
                }

                if($dateTo){
                    if($dateTo->lte($dateToDb)){
                        $message[] = ['key' => 'date_to', 'message' => "The dates entered overlap with others already entered"];
                    }
                }
            }
        });

        return $message;

    }
}