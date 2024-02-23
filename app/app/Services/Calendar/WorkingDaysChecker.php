<?php

namespace App\Services\Calendar;

use App\Models\WorkingDaysRule;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Carbon\CarbonPeriod;

class WorkingDaysChecker {

    public static function checkPeriod(CarbonInterface $start, CarbonInterface $end, $type, $companyId): array
    {
        $start = $start->setTime(0,0);
        $end = $end->setTime(0,0);
        
        $period = CarbonPeriod::since($start)->days(1)->until($end);

        $rules = WorkingDaysRule::where('company_id', $companyId)->get()->groupBy('type')->all();
       
        $days = collect($period);
        $result = $days->filter(function($date) use ($rules, $type) {
            $open = true;
            if(!empty($rules[0])) {
                foreach($rules[0] as $rule) {
                    if(static::checkDayByRule($date, $rule)) {
                        $open = false;
                    }
                }
                
                if(!empty($rules[1])) {
                    foreach($rules[1] as $rule) {
                        if(static::checkDayByRule($date, $rule)) {
                            $open = true;
                        }
                    }
                }
            }
            
            return $type == 0 ? !$open : $open; 
        });

        return array_values($result->toArray());
    }

    protected static function checkDayByRule(CarbonInterface $date, WorkingDaysRule $rule): bool
    {
        $start = $rule->start;
        $end = $rule->end ?? $rule->start;

        if($rule->repeat) {
            $start->setYear($date->year);
            $end->setYear($date->year);
        }
        
        if($date->betweenIncluded($start, $end)) {
            if(!empty($rule->days_of_week)) {
                return in_array($date->dayOfWeekIso, $rule->days_of_week);
            }

            return true;
        }
        
        return false;
    }
}