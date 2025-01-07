<?php

namespace App\Pricing;

use App\Models\BP;
use App\Models\Company;
use App\Models\Currency;
use App\Models\Item;
use App\Models\PurchasePriceList;
use App\Models\SaleDiscountMatrix;
use App\Models\SaleDiscountMatrixRow;
use App\Models\SalePriceList;
use App\Models\SaleTotalDiscountMatrix;
use App\Models\SaleTotalDiscountMatrixRow;
use App\Models\WACYearLayer;
use App\Models\WACYearLayersItemDetail;
use App\Services\Configurator\Pricing\PricingGenerator;
use App\Pricing\Exception\PricingException;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PriceCalculator
{
    /**
     * 
     * calculate the final sale price of a given item and return all information about
     * how the price has been calculated, including all components width dicount and margins.
     * this function is used as entrypoint for row item price calculation
     */
    public static function getSalePrice(
        Company $company,
        Item $item,
        BP $bp,
        Currency $currency,
        $quantity,
        $overrideTotalDiscount = null
    ): SalePrice
    {
        if($item->configured_item) {
            $mainProductData = ['quantity' => null, 'width' => null];
            //execute constraints plan
            $components = PricingGenerator::generate($item, $bp, $quantity);
            
            //calculate price of every component and generate details
            $componentPrices = [];
            foreach($components as $component) {
                $searchBy = $component['field'] == 'code' ? 'item' : 'IDitem';
                $componentItem = Item::where($searchBy, $component['item'])->where(function($query) use ($item) {
                    $query->where('IDcompany', $item->IDcompany)
                        ->orWhere('IDcompany', 0);
                })->firstOrFail();
                $priceComponent = static::getItemBaseSalePriceWithDiscount(
                    $company, 
                    $componentItem, 
                    $bp, 
                    $currency, 
                    $component['qty'], 
                    $component['width'] ?? null,
                    $component['min_price'] ?? null
                );
                $priceComponent->setNote($component['note'] ?? null);
                $priceComponent->setGroup($component['group']);

                $componentPrices[] = $priceComponent;

                //if the item is the main product item, save quantity and width for later
                $mainProductData = ['quantity' => $component['qty'], 'width' => $component['width'] ?? null];
            }
            //calculate price of every operations and generate details
            foreach($item->itemRouting as $routing) {
                //add the price of the process
                if($routing->price_item_id) {
                    $priceComponent = static::getItemBaseSalePriceWithDiscount(
                        $company, 
                        $routing->priceItem, 
                        $bp, 
                        $currency, 
                        $routing->quantity
                    );
                    $priceComponent->setProcess($routing->process_id);
                    $priceComponent->setNote($routing->note);
                    $componentPrices[] = $priceComponent;
                } 
                //add the price of the machine setup
                if($routing->setup_price_item_id) {
                    $priceComponent = static::getItemBaseSalePriceWithDiscount(
                        $company, 
                        $routing->setupPriceItem, 
                        $bp, 
                        $currency, 
                        1
                    );
                    $priceComponent->setProcess($routing->process_id);
                    $priceComponent->setNote($routing->note);
                    $componentPrices[] = $priceComponent;
                } 
            }
            
            $salePrice = new SalePrice($item, $quantity);

            //apply total discount matrix and update details
            $totalDiscount = null;
            if($mainProductData['quantity']) {
                $totalDiscount = static::getSaleItemTotalDiscount($company, $item, $bp, $currency, $mainProductData['quantity'], $mainProductData['width']);
            }
            if($totalDiscount) {
                //if there is a total discount override, save the std total discount as information
                $salePrice->setUsedTotalDiscount($totalDiscount);
            }
            //if there is a total discount override, substitute the std total discount
            if($overrideTotalDiscount !== null) {
                $totalDiscount = $overrideTotalDiscount;
            }
            if($totalDiscount !== null) {
                array_map(fn($component) => $component->applyTotalDiscount($totalDiscount), $componentPrices);
            }

            //calculate std cost of every
            $salePrice->addComponent($componentPrices);


            return $salePrice;
        }
        else {
            //calculate the price of itself as a component and generate details
            $componentPrice = static::getItemBaseSalePriceWithDiscount($company, $item, $bp, $currency, $quantity);
            $salePrice = new SalePrice($item, $quantity);
            
            //if there is a total discount override, substitute the std total discount
            if($overrideTotalDiscount !== null) {
                $componentPrice->applyTotalDiscount($overrideTotalDiscount);
            }
            $salePrice->addComponent($componentPrice);

            return $salePrice;
        }
    }

    /**
     * extract the base price for a given item from sales price lists.
     * it return a priceinfo object with all needed informations
     */
    public static function getItemBaseSalePrice(
        Company $company,
        Item $item,
        BP $bp,
        Currency $currency,
        $quantity,
        $width = null,
        $minPrice = null
    ): SalePriceComponent
    {
        if($item->configured_item) {
            throw new PricingException("Cannot extract configured item prices directly from price lists");
        }
        
        //extract all the price lists for the bp or where bp is null
        $priceLists = SalePriceList::where('company_id', $company->IDcompany)
            ->where('is_disabled', false)
            ->where('currency_id', $currency->id)
            ->where(function(Builder $query) use ($bp) {
                return $query->where('bp_id', $bp->IDbp)->orWhereNull('bp_id');
            })
            ->orderBy(DB::raw("
                CASE
                WHEN bp_id IS NOT NULL THEN 0
                ELSE 1
                END"
        ))->get(); //ensure price list with bp will be always on top. not every db orders null value the same way

        $selectedRow = null;
        foreach($priceLists as $priceList) {
            $selectedRow = $priceList->getMatchingRow($item, $quantity, $width);
            if($selectedRow) {
                break;
            }
        }

        if(!$selectedRow) {
            throw new PricingException("Cannot find any price in the price lists for the item {$item->item}");
        }

        $selectedRow->price = max($selectedRow->price, $minPrice);

        return new SalePriceComponent($item, $selectedRow, $quantity, $width, $currency);
    }


    public static function getSaleItemDiscount(Company $company, Item $item, SalePriceList $priceList, BP $bp, Currency $currency, $quantity): ?SaleDiscountMatrixRow
    {
        if($item->configured_item) {
            throw new PricingException("Cannot extract configured item discounts directly from matrices");
        }

        $matrices = SaleDiscountMatrix::where('company_id', $company->IDcompany)
            ->where('is_disabled', false)
            ->where(function(Builder $query) use ($bp) {
                return $query->where('bp_id', $bp->IDbp)->orWhereNull('bp_id');
            })
            ->where(function(Builder $query) use ($currency) {
                return $query->where('currency_id', $currency->id)->orWhereNull('currency_id');
            })
            ->where(function(Builder $query) use ($priceList) {
                return $query->where('sales_price_list_id', $priceList->id)->orWhereNull('sales_price_list_id');
            })
            ->orderBy('priority', 'DESC')
            ->get();

        $selectedRow = null;
        foreach($matrices as $matrix) {
            //get all valid rows (enabled and not expired) and associated with the item
            $rows = $matrix->rows()->scopes(['byItem' => [$item], 'valid' => []])->get();
            //group rows by priority
            $rows = $rows->groupBy(fn($row, $key) => $row->item_id ? 'item' : ($row->item_subfamily_id ? 'group' : 'family'))->all();
            
            $priority = ['item', 'group', 'family'];
            $fields = ['quantity' => $quantity];

            //select suitable rows based on quantity
            foreach($priority as $group) {
                if(!empty($rows[$group])) {
                    $suitableRows = $rows[$group];
                    
                    foreach($fields as $field => $value) {
                        if($value !== null) {
                            $selectedValue = null;
                            $valueFound = false;
                            //for every field remove value bigger than choosen value and value smaller but different than the first one found
                            //null is treated as 0
                            $suitableRows = $suitableRows
                                ->sortByDesc([
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
                                ->filter(function($row, $key) use($field, $value, &$selectedValue, &$valueFound) {
                                    if(
                                        $value < $row->$field && $row->$field !== null || 
                                        ($valueFound && $row->$field !== $selectedValue)
                                    ) {
                                        return false;
                                    }

                                    $selectedValue = $row->$field;
                                    $valueFound = true;
                                    
                                    return true;
                                })->all();

                            $suitableRows = collect($suitableRows);
                        } 
                    }
                    
                    $suitableCount = count($suitableRows);
                    if($suitableCount > 1) {
                        $ids = implode(', ', $suitableRows->pluck('id')->all());
                        throw new PricingException("The discount matrix {$matrix->id} has returned more than one row because of a rules conflict [{$ids}]");
                    }
                    else if ($suitableCount == 1) {
                        $selectedRow = $suitableRows[0];
                        break 2;
                    }
                }
            }
        }

        return $selectedRow;
    }

    public static function getItemBaseSalePriceWithDiscount(
        Company $company,
        Item $item,
        BP $bp,
        Currency $currency,
        $quantity,
        $width = null,
        $minPrice = null
    ): SalePriceComponent
    {
        $priceComponent = static::getItemBaseSalePrice($company, $item, $bp, $currency, $quantity, $width, $minPrice);
        //search and apply matrix discount
        $discountRow = static::getSaleItemDiscount(
            $company,
            $item, 
            $priceComponent->getPriceListRow()->salePriceList, 
            $bp, 
            $currency,
            $priceComponent->getQuantity()
        );
        
        if($discountRow) {
            $priceComponent->applyDiscount($discountRow);
        }

        return $priceComponent;
    }


    public static function getSaleItemTotalDiscount(Company $company, Item $item, BP $bp, Currency $currency, $quantity, $width = null): ?SaleTotalDiscountMatrixRow
    {
        if(!$item->configured_item) {
            throw new PricingException("Cannot apply total discount on a non-configured item");
        }

        $baseItem = $item->baseItem;
        $serviceItem = $item->getServiceItem();
        
        if(!$baseItem) {
            return null;
        }

        $matrices = SaleTotalDiscountMatrix::where('company_id', $company->IDcompany)
            ->where('is_disabled', false)
            ->where(function(Builder $query) use ($currency) {
                return $query->where('currency_id', $currency->id)->orWhereNull('currency_id');
            })
            ->orderBy('priority', 'DESC')
            ->get();
        
        $selectedRow = null;
        foreach($matrices as $matrix) {
            //get all valid rows (enabled and not expired) and associated with the item
            $allRows = $matrix->rows()
                ->where(function($q) use ($serviceItem) {
                    $q->whereNull('service_item_id');
                    if($serviceItem) {
                        $q->orWhere('service_item_id', $serviceItem->IDitem);
                    }
                })
                ->scopes(['byItem' => [$baseItem], 'valid' => [], 'byBP' => [$bp]])
                ->get();
            
            //group rows by bp or bp_group
            
            $allRows = $allRows->groupBy(fn($row, $key) => $row->bp_id ? 'bp' : ($row->bp_group_id ? 'group' : 'generic'))->all();
            $bpPriority = ['bp', 'group', 'generic'];
            $serviceItemPriority = ['with_service_item', 'without_service_item'];
            $fields = ['width' => $width, 'quantity' => $quantity];

            foreach($bpPriority as $bpGroup) {
                //group rows by priority
                if(!empty($allRows[$bpGroup])) {
                    $byServiceItemRows = $allRows[$bpGroup]
                        ->groupBy(fn($row, $key) => $row->service_item_id ? 'with_service_item' : 'without_service_item')
                        ->all();

                    foreach($serviceItemPriority as $serviceItemGroup) {

                        if(!empty($byServiceItemRows[$serviceItemGroup])) {
                            $rows = $byServiceItemRows[$serviceItemGroup]
                            ->groupBy(fn($row, $key) => $row->item_id ? 'item' : ($row->item_subfamily_id ? 'group' : ($row->item_subfamily_id ? 'family' : 'others')))
                            ->all();
                        
                            $priority = ['item', 'group', 'family', 'others'];

                            //select suitable rows based on quantity
                            foreach($priority as $group) {
                                if(!empty($rows[$group])) {
                                    $suitableRows = $rows[$group];
                                    
                                    foreach($fields as $field => $value) {
                                        if($value !== null) {
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
                                                ->filter(function($row, $key) use($field, $value, &$selectedValue, &$valueFound) {
                                                    if(
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
                                        } 
                                    }
                                    
                                    $suitableCount = count($suitableRows);
                                    if($suitableCount > 1) {
                                        $ids = implode(', ', $suitableRows->pluck('id')->all());
                                        throw new PricingException("The total discount matrix {$matrix->id} has returned more than one row because of a rules conflict [{$ids}]");
                                    }
                                    else if ($suitableCount == 1) {
                                        $selectedRow = $suitableRows[0];
                                        break 4;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return $selectedRow;
    }

    /**
     * calculate the std cost of an item. the std cost is always in the company currency
     */
    public static function getStdCost(Item $item, Company $company, $quantity, Currency $currency) 
    {
        if($item->configured_item) {
            $stdCost = 0;
            foreach($item->itemMaterials as $material) {
                $stdCost += static::getStdCost($material->item, $company, $material->quantity, $currency);
            }
            
            return $stdCost;
        }
        else {
            //search the std cost in the wac
            $wacLayer = WACYearLayer::where('IDcompany', $company->IDcompany)->where('definitive', 1)->orderByDesc('year_layer')->first();
            if($wacLayer) {
                $wac = WACYearLayersItemDetail::where('IDcompany', $company->IDcompany)
                    ->where('year_layer', $wacLayer->year_layer)
                    ->where('IDitem', $item->IDitem)
                    ->first();
                if($wac) {
                    return $wac->wac_avg_cost;
                }
            }
            //if the std cost is not present in the wac, get the purchase price in the main pricelist
            $priceList = PurchasePriceList::where('company_id', $company->IDcompany)
                ->where('is_disabled', false)
                ->where('currency_id', $currency->id)
                ->whereNull('bp_id')
                ->first();
            
            if($priceList) {
                $purchasePrice = $priceList->getMatchingRow($item, $quantity);
                if($purchasePrice) {
                    return $purchasePrice->price;
                }
            }


            return 0;
        }
    }

    public static function getRoutingCost(
        Company $company,
        Item $item,
        BP $bp,
        Currency $currency,
    ): RoutingCost
    {
        if(!$item->configured_item) {
            throw new PricingException("Cannot calculate routing cost on a non-configured item");
        }

        $routingCosts = [];
        foreach($item->itemRouting as $routing) {
            //add the price of the process
            if($routing->operator_cost_item_id) {
                $priceComponent = static::getItemBaseSalePriceWithDiscount(
                    $company, 
                    $routing->operatorCostItem, 
                    $bp, 
                    $currency, 
                    ($routing->execution_time * $routing->quantity * $routing->operation_men_occupation) + $routing->setup_time
                );
                $priceComponent->setProcess($routing->process_id);
                $priceComponent->setNote($routing->note);
                $routingCosts[] = $priceComponent;
            } 
            //add the price of the machine setup
            if($routing->machine_cost_item_id) {
                $priceComponent = static::getItemBaseSalePriceWithDiscount(
                    $company, 
                    $routing->machineCostItem, 
                    $bp, 
                    $currency, 
                    $routing->execution_time * $routing->quantity * ($routing->machine_men_occupation ?? $routing->operation_men_occupation)
                );
                $priceComponent->setProcess($routing->process_id);
                $priceComponent->setNote($routing->note);
                $routingCosts[] = $priceComponent;
            } 
        }

        $routingCost = new RoutingCost($item);
        $routingCost->addComponent($routingCosts);

        return $routingCost;
    }


    /**
     * extract the base price for a given item from purchase price lists.
     * it return a priceinfo object with all needed informations
     */
    public static function getItemBasePurchasePrice(
        Company $company,
        Item $item,
        BP $bp,
        Currency $currency,
        $quantity,
        $width = null
    ): SalePriceComponent
    {
        if($item->configured_item) {
            throw new PricingException("Cannot extract configured item prices directly from price lists");
        }
        
        //extract all the price lists for the bp or where bp is null
        $priceLists = PurchasePriceList::where('company_id', $company->IDcompany)
            ->where('is_disabled', false)
            ->where('currency_id', $currency->id)
            ->where(function(Builder $query) use ($bp) {
                return $query->where('bp_id', $bp->IDbp)->orWhereNull('bp_id');
            })
            ->orderBy(DB::raw("
                CASE
                WHEN bp_id IS NOT NULL THEN 0
                ELSE 1
                END"
        ))->get(); //ensure price list with bp will be always on top. not every db orders null value the same way


        $selectedRow = null;
        foreach($priceLists as $priceList) {
            $selectedRow = $priceList->getMatchingRow($item, $quantity, $width);
            if($selectedRow) {
                break;
            }
        }

        if(!$selectedRow) {
            throw new PricingException("Cannot find any price in the price lists for the item {$item->item}");
        }

        return new SalePriceComponent($item, $selectedRow, $quantity, $width, $currency);
    }


    public static function getItemBasePurchasePriceWithDiscount(
        Company $company,
        Item $item,
        BP $bp,
        Currency $currency,
        $quantity,
        $width = null
    ): SalePriceComponent
    {
        $priceComponent = static::getItemBasePurchasePrice($company, $item, $bp, $currency, $quantity, $width);
        //search and apply matrix discount

        return $priceComponent;
    }

    
}