<?php

namespace App\Models;

use App\Configurator\Debug\DevTools;
use App\Configurator\Exception\ConfiguratorException;
use App\Enum\SaleRowState;
use App\Pricing\CurrencyConverter;
use App\Pricing\PriceCalculator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\Workflow\Marking;
use Symfony\Component\Workflow\Workflow;
use Symfony\Component\Workflow\Transition;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Symfony\Component\Workflow\DefinitionBuilder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Services\Configurator\Configuration\ConfigurationEvent;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaleRow extends Model
{
    use HasFactory;

    use Traits\HasCustomId;
    use Traits\LogsActivity;
    use Traits\HasStateTransition;

    protected $guarded = [
        'id',
        'price',
        'total_price',
        'discount',
        'company_id',
        'created_at',
        'standard_product_id',
        'sale_id',
        'price',
        'final_price',
        'discount',
        'cost',
        'routing_cost',
        'profit',
        'total_price',
        'total_final_price',
        'total_discount',
        'total_cost',
        'total_routing_cost',
        'total_profit',
        'override_total_discount_to_approve',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'delivery_date' => 'date',
        'state' => SaleRowState::class,
        'quantity' => 'double',
        'price' => 'double',
        'final_price' => 'double',
        'discount' => 'double',
        'cost' => 'double',
        'routing_cost' => 'double',
        'profit' => 'double',
        'total_price' => 'double',
        'total_final_price' => 'double',
        'total_discount' => 'double',
        'total_cost' => 'double',
        'total_routing_cost' => 'double',
        'total_profit' => 'double',
        'override_total_discount_to_approve' => 'boolean',
        'override_total_discount' => 'double',
    ];
    
    public $timestamps = false;

    protected $forcePriceRecalc = false;

    protected $lockPrices = false;

    protected $totalDiscountAutoApproval = false;

    protected static function booted(): void
    {
        parent::booted();

        static::saving(function (SaleRow $row) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save sale rows outside of a transaction");
            }
            //if the prices must be recalculated, it requires the ovverride discount to be approved again
            if($row->shouldRecalculatePrices() && $row->override_total_discount !== null) {
                $row->override_total_discount_to_approve = !$row->totalDiscountAutoApproval;
            }
        });

        static::saved(function (SaleRow $row) {
            if($row->shouldRecalculatePrices()) {     
                static::withoutEvents(function () use ($row) {    
                    $row->calculatePrices();
                    $row->forcePriceRecalc(false);
                });
            }
        });
    }

    public function forcePriceRecalc($force = true)
    {
        $this->forcePriceRecalc = $force;
    }

    public function lockPrices($lock = true)
    {
        $this->lockPrices = $lock;
    }

    public function totalDiscountAutoApproval($auto = true)
    {
        $this->totalDiscountAutoApproval = $auto;
    }

    protected function getStateManager()
    {
        $definitionBuilder = new DefinitionBuilder();
        $definition = $definitionBuilder->addPlaces([
                SaleRowState::active->value,
                SaleRowState::canceled->value,
                SaleRowState::closed->value,
            ])
            ->addTransition(new Transition('canceled', 'active', 'canceled'))
            ->addTransition(new Transition('closed', 'active', 'closed'))
            ->build();
        
        return $this->makeStateManager($definition, 'state');
    }

    protected static function createItemForRow($data, User $user, $bpId)
    {
        $product = StandardProduct::findOrFail($data['standard_product_id']);
        $execution = ConfigurationEvent::completeEvent(
            $product, 
            $data['configuration'],
            $bpId, 
        );
        if(!$execution['status']) {
            Log::channel('configurator')->error("Cannot create item from configuration");
            Log::channel('configurator')->error($execution);
            throw new ConfiguratorException("Cannot create item from configuration");
        }
        
        $configuration = new \App\Configurator\Configuration\Configuration(
            $product,
            $execution['data']['configuration']
        );
        
        if(!$configuration->isValid()) {
            Log::channel('configurator')->error("Configured product contains invalid configuration");
            Log::channel('configurator')->error($configuration->getConfiguration());
            DevTools::emit('error', 422, $configuration->getLatestErrors()->all());
            throw new ConfiguratorException("Configured product contains invalid configuration");
        }

        $workcenter = Workcenter::findOrFail($data['workcenter_id']);

        $item = Item::createFromConfiguration(
            $product,
            $configuration,
            $user->company,
            $workcenter
        );

        return $item;
    }

    public static function buildFromSaleRowData(
        array $data, 
        User $user,
        $bpId,
    ): static
    {
        if(!empty($data['standard_product_id'])){

            $item = static::createItemForRow($data, $user, $bpId);
            
            unset($data['standard_product_id']);
            unset($data['configuration']);

            $data['item_id'] = $item->IDitem;
        }

        $data['state'] = SaleRowState::active;

        $row = new static($data);
        $row->created_at = now()->format('Y-m-d H:i:s');
        $row->company_id = $user->IDcompany;

        return $row;
    }


    public static function updateFromSaleRowData(
        array $data, 
        User $user,
        $bpId,
    ): static
    {
        $id = $data['id'];
        unset($data['id']);

        $row = static::find($id);
        if(!empty($data['standard_product_id'])){
            $item = static::createItemForRow($data, $user, $bpId);
            
            unset($data['standard_product_id']);
            unset($data['configuration']);

            $data['item_id'] = $item->IDitem;
        }

        //$row->mergeGuarded(['item_id', 'quantity']);
        $row->fill($data);
        if(!empty($data['force_price_processing'])) {
            $row->forcePriceRecalc();
        }

        return $row;
    }

    public function shouldRecalculatePrices()
    {
        return !$this->lockPrices  && 
            ($this->isDirty(['item_id', 'quantity', 'workcenter_id', 'override_total_discount']) || $this->forcePriceRecalc);
    }


    public function calculatePrices($persist = true)
    {
        return DB::transaction(function() use ($persist) {
            //get sale price with all components
            $priceInfo = PriceCalculator::getSalePrice(
                $this->sale->company,
                $this->item,
                $this->sale->bp,
                $this->sale->currency,
                $this->quantity,
                $this->override_total_discount
            );
            
            $priceComponents = [];
            $companyCurrency = $this->sale->companyCurrency;

            foreach($priceInfo->getComponents() as $i => $component) {
                $priceComponent = SaleRowPriceComponent::createFromSalePriceComponent($component);
                $priceComponent->company_id = $this->sale->company->IDcompany;
                $priceComponent->position = $i+1;
                ////calculate the std cost and margin for every component 
                $stdCost = PriceCalculator::getStdCost(
                    $component->getItem(),
                    $this->sale->company,
                    $component->getQuantity(),
                    $companyCurrency
                );
                $priceComponent->calculateProfit($stdCost, $this->sale->currency, $companyCurrency);    
                $priceComponents[] = $priceComponent;
            }

            if($persist) {
                //delete previous existing components
                $this->salePriceComponents()->delete();
                $this->salePriceComponents()->saveMany($priceComponents);
            }
            else {
                $this->salePriceComponents = $this->salePriceComponents()->getRelated()->newCollection()->concat($priceComponents);
            }

            //get the std cost for the main product
            $mainStdCost = PriceCalculator::getStdCost(
                $this->item,
                $this->sale->company,
                $this->quantity,
                $companyCurrency
            );
            $mainStdCost = $companyCurrency->detailedRound($mainStdCost);

            $routingCost = null;
            if($this->item->configured_item) {
                //calculate the routing cost
                $routingCost = PriceCalculator::getRoutingCost(
                    $this->sale->company,
                    $this->item,
                    $this->sale->bp,
                    $this->sale->currency,
                );
                $routingCostComponents = [];
                foreach($routingCost->getComponents() as $i => $component) {
                    $routingComponent = SaleRowRoutingCostComponent::createFromSalePriceComponent($component);
                    $routingComponent->company_id = $this->sale->company->IDcompany;
                    $routingComponent->position = $i+1;
                    $routingCostComponents[] = $routingComponent;
                }

                if($persist) {
                    //delete previous existing components
                    $this->saleRoutingCostComponents()->delete();
                    $this->saleRoutingCostComponents()->saveMany($routingCostComponents);
                }
                else {
                    $this->saleRoutingCostComponents = $this->saleRoutingCostComponents()->getRelated()->newCollection()->concat($routingCostComponents);
                }
            }
            
            //set all main row level prices and costs and profit (price, final_price, discount, cost, routing_cost, profit,
            // total_price, total_final_price, total_discount, total_cost, total_routing_cost, total_profit, unit_total, total)

            $this->price = $priceInfo->getPrice(); //unit price without discounts
            $this->final_price = $priceInfo->getFinalPrice(); //unit price with discounts
            $this->discount = $priceInfo->getDiscount(); //total amount of discount for single unit
            $this->sale_total_discount_matrix_row_id = $priceInfo->getUsedTotalDiscount()?->id; //total discount applied to all components
            $this->cost = $mainStdCost; //unit std cost
            if($routingCost) {
                $this->routing_cost = $routingCost->getCost(); //unit routing cost
            }

            $this->calculateProfit();

            $this->total_price = $priceInfo->getTotalPrice(); //total price without discounts
            $this->total_final_price = $priceInfo->getTotalFinalPrice(); //total price with discounts
            $this->total_discount = $priceInfo->getTotalDiscount(); //total discount amount
            $this->total_cost = $this->cost * $this->quantity; //total std cost
            if($this->routing_cost) {
                $this->total_routing_cost = $this->routing_cost * $this->quantity; //total routing cost
            }
            
            foreach(['price', 'final_price', 'discount', 'total_price', 'total_final_price', 'total_discount'] as $f) {
                if($this->{$f} !== null) {
                    $this->{$f} = $this->sale->currency->round($this->{$f});
                }
            }
            /*
            foreach(['cost', 'profit', 'total_cost', 'total_profit'] as $f) {
                if($this->{$f} !== null) {
                    $this->{$f} = $companyCurrency->round($this->{$f});
                }
            }
            */

            if($persist) {
                return $this->save();
            }
            return true;
        });
    }

    public function calculateProfit()
    {
        $convertedFinalPrice = CurrencyConverter::convert($this->company, $this->final_price, $this->sale->currency, $this->sale->companyCurrency);
        $this->profit = $convertedFinalPrice - $this->cost; //unit profit. for base item, profit = final price - std cost
        if($this->routing_cost) {
            $this->profit -= CurrencyConverter::convert($this->company, $this->routing_cost, $this->sale->currency, $this->sale->companyCurrency); //only for configurable product, profit = final price - std cost - routing cost
        }
        $this->profit = $this->sale->companyCurrency->detailedRound($this->profit);
        $this->total_profit = $this->sale->companyCurrency->detailedRound($this->profit * $this->quantity); //total profit. 
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'id');
    }

    /**
     * Get the carrier that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function carrier(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'carrier_id', 'IDbp');
    }

    /**
     * Get the company that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }
    
    /**
     * Get the deliveryTerm that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function deliveryTerm(): BelongsTo
    {
        return $this->belongsTo(DeliveryTerm::class, 'delivery_term_id', 'id');
    }
    
    /**
     * Get the destinationAddressId that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function destinationAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'destination_address_id', 'id');
    }
    
    /**
     * Get the orderType that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function orderType(): BelongsTo
    {
        return $this->belongsTo(OrderType::class, 'order_type_id', 'id');
    }

    /**
     * Get the item that owns the SaleRow
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'IDitem');
    }

    /**
     * Get the workcenter that owns the SaleRow
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function workcenter(): BelongsTo
    {
        return $this->belongsTo(Workcenter::class, 'workcenter_id', 'id');
    }

    public function salePriceComponents(): HasMany
    {
        return $this->hasMany(SaleRowPriceComponent::class, 'sale_row_id', 'id');
    }

    public function saleRoutingCostComponents(): HasMany
    {
        return $this->hasMany(SaleRowRoutingCostComponent::class, 'sale_row_id', 'id');
    }

    public function saleTotalDiscountMatrixRow(): BelongsTo
    {
        return $this->belongsTo(SaleTotalDiscountMatrixRow::class, 'sale_total_discount_matrix_row_id', 'id');
    }
}
