<?php

namespace App\Models\Traits;

use App\Models\Item;
use App\Pricing\Exception\PricingException;

trait PriceListUtils {

    public function getMatchingRow(Item $item, $quantity, $width = null)
    {
        $rows = $this->rows()->scopes(['byItem' => [$item], 'valid' => []])->get();
        //group rows by priority
        $rows = $rows->groupBy(fn($row, $key) => $row->item_id ? 'item' : ($row->item_subfamily_id ? 'group' : 'family'))->all();
        
        $priority = ['item', 'group', 'family'];
        $fields = ['width' => $width, 'quantity' => $quantity];
        $notConfiguratorOnlyFields = ['quantity'];

        //select suitable rows based on quantity and width
        foreach($priority as $group) {
            if(!empty($rows[$group])) {
                $suitableRows = $rows[$group];
                
                foreach($fields as $field => $value) {
                    //if($value !== null) {
                        $selectedValue = null;
                        $valueFound = false;
                        //for every field remove value smaller than choosen value and value greater but different than the first one found
                        //null is treated as the biggest number
                        $suitableRows = $suitableRows
                            ->sortBy([
                                function($a, $b) use ($field) {
                                    if($a[$field] === null) {
                                        return 1;
                                    }
                                    if($b[$field] === null) {
                                        return -1;
                                    }
                                    return $a[$field]<=>$b[$field];
                                }
                            ])
                            ->filter(function($row, $key) use($field, $value, &$selectedValue, &$valueFound, $notConfiguratorOnlyFields) {
                                if(
                                    (!in_array($field, $notConfiguratorOnlyFields) && $value === null && $row->$field !== null) ||
                                    $value > $row->$field && $row->$field !== null || 
                                    ($valueFound && $row->$field !== $selectedValue)
                                ) {
                                    return false;
                                }

                                $selectedValue = $row->$field;
                                $valueFound = true;
                                
                                return true;
                            })->all();

                        $suitableRows = collect($suitableRows);
                    //} 
                }
                
                $suitableCount = count($suitableRows);
                if($suitableCount > 1) {
                    $ids = implode(', ', $suitableRows->pluck('id')->all());
                    throw new PricingException("The price list {$this->code} has returned more than one price because of a rules conflict [{$ids}]");
                }
                else if ($suitableCount == 1) {
                    return $suitableRows->first();
                }
            }
        }

        return null;
    }
}