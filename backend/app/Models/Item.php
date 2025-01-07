<?php

namespace App\Models;

use App\Configurator\Configuration\Configuration;
use App\Configurator\Debug\DevTools;
use App\Configurator\Exception\ConfiguratorException;
use App\Enum\ItemType;
use App\Services\Configurator\BOM\BOMGenerator;
use App\Services\Configurator\Configuration\ItemDescriptionGenerator;
use App\Services\Configurator\Routing\RoutingGenerator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class Item extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    use Traits\LogsActivity;

    protected $table = 'item';

    protected $primaryKey = 'IDitem';

    public $timestamps = false;

    //protected $appends = ['configuration_details'];

    public $fillable = [
        //'item',
        'type',
        'item_desc',
        'long_description',
        'production_description',
        'um',
        'item_group',
        'DefaultUnitValue',
        'item_subgroup',
        'weight_um',
        'weight',
        'product_line',
        'customs_code',
        'std_joint',
        'std_joint_guides',
        'number_of_plies',
        'configurator_only'
        //'classification_l1',
        //'classification_l2',
        //'owner',
    ];

    protected $casts = [
        'configuration' => 'array',
        'type' => ItemType::class,
        'configured_item' => 'boolean',
        'configurator_only' => 'boolean'
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::creating(function (Item $item) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot create item outside of a transaction");
            }
            if(!$item->item_group) {
                return false;
            }

            if(!$item->item) {
                //lock the row to avoid race conditions
                if($item->standard_product_id) {
                    $latest = static::query()
                        ->selectRaw("max(cast(replace(item, ? , '') as int)) AS latest", [$item->standardProduct->code])
                        //->where('IDcompany', $item->IDcompany)
                        ->where('standard_product_id', $item->standard_product_id)
                        ->lockForUpdate()
                        ->first();
                        
                    $item->item =  $item->standardProduct->code . ($latest->latest ? $latest->latest + 1 : 1);
                }
                else {
                    $latest = static::query()
                        ->selectRaw("max(cast(replace(item, ? , '') as int)) AS latest", [$item->item_group])
                        ->where('IDcompany', $item->IDcompany)
                        ->where('item_group', $item->item_group)
                        ->where(function($q){
                            $q->whereNull('configured_item')->orWhere('configured_item', 0);
                        })
                        ->lockForUpdate()
                        ->first();

                    $item->item = $item->item_group . ($latest->latest ? $latest->latest + 1 : 1);
                }
            }

            return true;
        });

        static::created(function (Item $item) {
            if(!$item->enable($item->IDcompany)) {
                throw new \Exception("Error during the activation of the item");
            }
        });

        static::saving(function(Item $item){
            if(!in_array($item->type, [ItemType::product, ItemType::purchased])){
                $item->number_of_plies = null;
                $item->weight = 0;
                $item->weight_um = null;
                $item->customs_code = null;
            }

            if($item->IDitem){
                $item->item_group = $item->getOriginal('item_group');
            }
        });
    }

     /**
     * Get the company that owns the Item
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

     /**
     * Get the um that owns the Item
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Um::class, 'um', 'IDdim');
    }

    /**
     * Get all of the itemEnabled
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function itemEnabled(): HasMany
    {
        return $this->hasMany(ItemEnabled::class, 'IDitem', 'IDitem');
    }

    /**
     * Get all of the itemEnabled for the Item based on company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function itemEnabledCompany(): HasOne
    {
        return $this->itemEnabled()->one();
    }

    /**
     * Get all of the itemStockLimits for the Item
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function itemStockLimits(): HasMany
    {
        return $this->hasMany(ItemStockLimit::class, 'IDitem', 'IDitem');
    }

    /**
     * Get all of the lots for the Item
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lots(): HasMany
    {
        return $this->hasMany(Lot::class, 'IDitem', 'IDitem');
    }

    /**
     * Get all of the itemGroups for the Item
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function itemGroup(): BelongsTo
    {
        return $this->belongsTo(ItemGroup::class, 'item_group', 'item_group');
    }

    public function itemSubfamily(): BelongsTo
    {
        return $this->belongsTo(ItemSubfamily::class, 'item_subgroup', 'id');
    }

    public function itemLine(): BelongsTo
    {
        return $this->belongsTo(ItemLine::class, 'product_line', 'id');
    }

    public function baseItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'base_item_id', 'IDitem');
    }

    /**
     * Get the standard product that owns the Item
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function standardProduct(): BelongsTo
    {
        return $this->belongsTo(StandardProduct::class, 'standard_product_id', 'id');
    }

    public function itemMaterials(): HasMany
    {
        return $this->hasMany(ItemMaterial::class, 'configured_item_id', 'IDitem');
    }

    public function itemRouting(): HasMany
    {
        return $this->hasMany(ItemRouting::class, 'item_id', 'IDitem');
    }


    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->whereIn('IDcompany', [0, $user->IDcompany]);
    }

    public function scopeByUserStrict(Builder $query, User $user): void 
    {
        $query->where('IDcompany', $user->IDcompany);
    }

    public function enable($companyId) 
    {
        return $this->itemEnabled()->firstOrCreate(
            ['IDcompany' => $companyId]
        );
    }

    public function disable($companyId) 
    {
        return $this->itemEnabledCompany()->where('IDcompany', $companyId)->delete();
    }

    public function isEnabled($companyId): bool
    {
        return $this->itemEnabledCompany()->where('IDcompany', $companyId)->exists();
    }

    public function setAlternative($companyId, ?string $alternativeCode, ?string $alternativeDescription)
    {
        $enabledEntity = $this->itemEnabledCompany()->where('IDcompany', $companyId)->first();
        if($enabledEntity) {
            $enabledEntity->altv_code = $alternativeCode;
            $enabledEntity->altv_desc = $alternativeDescription;

            return $enabledEntity->save();
        }

        return false;
    }

    public static function getItems(User $user, $itemEnabled = null): Builder
    {
        $r = Item::byUser($user);

        if($itemEnabled){
            $r->whereHas('itemEnabledCompany', function($builder) use ($user){
                $builder->where('IDcompany', $user->IDcompany);
            });   
        }else if($itemEnabled === false) {
            $r->whereDoesntHave('itemEnabledCompany', function($builder) use ($user){
                $builder->where('IDcompany', $user->IDcompany);
            }); 
        }
                
        $r->with([
            'company',
            'itemEnabledCompany'=> function($builder) use ($user){
                $builder->where('IDcompany', $user->IDcompany);
            }
        ]);

        return $r;
    }

    /**
     * create a new configurated item based on configuration info
     */
    public static function createFromConfiguration(
        StandardProduct $standardProduct,
        Configuration $configuration,
        Company $company,
        Workcenter $workcenter
    ) : Item
    {
        $item = DB::transaction(function() use ($standardProduct, $configuration, $company, $workcenter) {
            $item = Item::unguarded(function() use ($standardProduct, $configuration, $company, $workcenter){

                $baseItem = $configuration->getBaseItem();
                if($baseItem) {
                    $baseItem = static::where('IDitem', $baseItem)->first();
                }

                $description = ItemDescriptionGenerator::generateDescription($standardProduct,  $configuration->getFeatures());
                if($description === false) {
                    throw new ConfiguratorException(sprintf("Cannot generate description for item %s", $standardProduct->name));
                }

                $description = $description ?: implode(
                    "\n", 
                    array_map(
                        fn($f) => $f['label'] . ': ' . implode(', ', array_column($f['value'], 'label')), 
                        static::getConfigurationDetails($configuration->getConfigurationData())
                    )
                );

                $longDescription = ItemDescriptionGenerator::generateLongDescription($standardProduct,  $configuration->getFeatures());
                if($longDescription === false) {
                    throw new ConfiguratorException(sprintf("Cannot generate description for item %s", $standardProduct->name));
                }

                $longDescription ??= $description;

                $productionDescription = ItemDescriptionGenerator::generateLongDescription($standardProduct,  $configuration->getFeatures());
                if($productionDescription === false) {
                    throw new ConfiguratorException(sprintf("Cannot generate production description for item %s", $standardProduct->name));
                }


                return Item::create([
                    'item_desc' => $description,
                    'long_description' => $longDescription,
                    'production_description' => $productionDescription,
                    'um' => $standardProduct->um->IDdim,
                    'item_group' => $standardProduct->itemGroup->item_group,
                    'IDcompany' => $company->IDcompany,
                    'configured_item' => 1,
                    'configuration' => $configuration->getConfigurationData(),
                    'standard_product_id' => $standardProduct->id,
                    'item_subgroup' => $baseItem ? $baseItem->item_subgroup : null,
                    'product_line' => $baseItem ? $baseItem->product_line : null,
                    'base_item_id' => $baseItem ? $baseItem->IDitem : null,
                    'type' => ItemType::product
                ]);
            });

            $item->generateBOM();
            $item->generateRouting($workcenter);

            return $item;
            
        });

        

        return $item;
    }

    public function generateBOM()
    {
        $bom = BOMGenerator::generate($this);
        
        DB::transaction(function() use ($bom) {
            
            $this->itemMaterials()->delete();
            
            foreach($bom as $i => $material) {
                try {
                    if($material['field'] == 'code') {
                        $baseItem = Item::where('item', $material['item'])->firstOrFail();
                    }
                    else {
                        $baseItem = Item::where('IDitem', $material['item'])->firstOrFail();
                    }
                }
                catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                    Log::channel('configurator')->error(sprintf("Cannot find item with %s %s", $material['field'], $material['item']));
                    throw new ConfiguratorException(sprintf("Cannot find item with %s %s", $material['field'], $material['item']));
                }
                
                $itemMaterial = new ItemMaterial([
                    'position' => $i + 1,
                    'item_id' => $baseItem->IDitem,
                    'quantity'=> $material['qty'],
                    'process_id' => $material['process'],
                    'configured_item_id' => $this->IDitem
                ]);

                try {
                    if(!$this->itemMaterials()->save($itemMaterial)) {
                        throw new ConfiguratorException(sprintf("cannot save BOM material for item %s", $this->standardProduct->name));
                    }
                }
                catch(\Exception $e) {
                    Log::channel('configurator')->error("Error during saving of material");
                    Log::channel('configurator')->error($itemMaterial);
                    throw $e;
                }
            }

            return true;
        });
    }

    public function generateRouting(Workcenter $workcenter)
    {
        $routing = RoutingGenerator::generate($this);
        
        DB::transaction(function() use ($routing, $workcenter) {
            
            $this->itemRouting()->delete();
            
            foreach($routing as $i => $route) {

                $process = Process::findOrFail($route['process']);
                $defaultMachine = null;
                if($process->need_machine) {
                    $defaultMachine = $process->getDefaultMachine($workcenter->id);
                    if(!$defaultMachine) {
                        $error = sprintf("The process \"%s\" does not have a default machine for the workcenter \"%s\"" , $process->name, $workcenter->name);
                        Log::channel('configurator')->error($error);
                        throw new ConfiguratorException($error);
                    }
                }
                
                $itemRoute = new ItemRouting([
                    'process_id' => $process->id,
                    'price_item_id' => $process->price_item_id,
                    'quantity' => $route['quantity'],
                    'setup_price_item_id' => $process->setup_price_item_id,
                    'operator_cost_item_id' => $process->operator_cost_item_id,
                    'machine_cost_item_id' => $defaultMachine?->cost_item_id,
                    'execution_time' => $process->execution_time,
                    'setup_time' => $process->setup_time,
                    'operation_men_occupation' => $process->men_occupation,
                    'machine_men_occupation' => $defaultMachine?->men_occupation,
                    'position' => $i + 1,
                    'note' => $route['note']
                ]);

                try {
                    if(!$this->itemRouting()->save($itemRoute)) {
                        throw new ConfiguratorException(sprintf("cannot create routing for item %s", $this->standardProduct->name));
                    }
                }
                catch(\Exception $e) {
                    Log::channel('configurator')->error("Error during creating of routing");
                    Log::channel('configurator')->error($itemRoute);
                    throw $e;
                }
                
            }
            
            return true;
        });
    }

    public function getConfigurationFeatures()
    {
        return $this->configuration['features'] ?? [];
    }

    protected function configurationDetails(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->configured_item && $this->configuration ? 
                array_values(static::getConfigurationDetails($this->configuration))
                : null,
        );
    }

    protected static function getConfigurationDetails($configurationData)
    {
        $data = [];
        $featuresConfiguration = $configurationData['features_configuration'];
        
        uksort(
            $configurationData['features'], 
            fn($a, $b) =>  $featuresConfiguration[$a]['position'] <=> $featuresConfiguration[$b]['position']
        );

        foreach($configurationData['features'] as $feature => $value) {
            if(isset($featuresConfiguration[$feature])) {
                $data[$feature] = [
                    'feature' => $feature,
                    'label' => $featuresConfiguration[$feature]['feature']['label'],
                ];
                
                $values = $featuresConfiguration[$feature]['multiple'] ? $value : [$value];
                switch($featuresConfiguration[$feature]['feature']['feature_type_id']) {
                    case 'bool':
                        $data[$feature]['value'] = array_map(
                            fn($v) => ['original' => $v, 'label' => $v ? 'Yes' : 'No']
                        , $values);
                        break;
                    case 'dropdown':
                    case 'product':
                        $data[$feature]['value'] = array_map(
                            fn($v) => [
                                'original' => $v, 
                                'label' => $configurationData['selected_options'][$feature]['values'][$v] ?? $v
                            ]
                        , $values);
                        break;
                    default:
                        $data[$feature]['value'] = array_map(
                            fn($v) => ['original' => $v, 'label' => $v]
                        , $values);
                }
            }
        }
        
        return $data;
    }

    public static function searchByDesc($search, $enabled, User $user): Builder
    {
        $items = static::getItems(
            $user,
            $enabled
        );

        if($search) {
            $items->where(function(Builder $q) use ($search) {
                $q->where(DB::raw("CONCAT(item.item , ' ', item.item_desc)"), 'like', '%'.$search.'%')
                    ->orWhere('item.IDitem', $search);
            })
            ->orderBy(DB::raw("
                CASE
                WHEN CONCAT(item.item , ' ', item.item_desc) LIKE ? THEN 1
                WHEN CONCAT(item.item , ' ', item.item_desc) LIKE ? THEN 2
                WHEN CONCAT(item.item , ' ', item.item_desc) LIKE ? THEN 4
                ELSE 3
                END"
            ))
            ->getQuery()
            ->addBinding($search, 'order')
            ->addBinding($search.'%', 'order')
            ->addBinding('%'.$search, 'order');
        }

        return $items;
    }

    public function getServiceItem()
    {
        if($this->configured_item && $this->configuration && !empty($this->configuration['features_configuration'])) {
            foreach($this->configuration['features_configuration'] as $feature => $data) {
                if(!empty($data['feature_attribute_id']) && $data['feature_attribute_id'] == 'service_item') {
                    $features = $this->getConfigurationFeatures();
                    $item = $features[$feature] ?? null;
                    return $item ? static::find($item) : null;
                }
            }
        }

        return null;
    }
}
