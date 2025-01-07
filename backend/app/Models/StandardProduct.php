<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StandardProduct extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    use Traits\LogsActivity;

    protected $table = 'standard_products';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'name',
        'item_group_id',
        'code',
        'company_id',
        'um_id',
        'description_constraint_id',
        'long_description_constraint_id',
        'production_description_constraint_id'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    public function itemGroup(): BelongsTo
    {
        return $this->belongsTo(ItemGroup::class, 'item_group_id', 'item_group');
    }

    public function um(): BelongsTo
    {
        return $this->belongsTo(Um::class, 'um_id', 'IDdim');
    }
    
    public function configurationFeatures(): HasMany
    {
        return $this->hasMany(ProductConfigurationFeature::class)->with('feature');
    }

    public function BOMRules(): HasMany
    {
        return $this->hasMany(ProductBOMRule::class);
    }

    public function routings(): HasMany
    {
        return $this->hasMany(ProductRouting::class);
    }

    public function salePricingRules(): HasMany
    {
        return $this->hasMany(ProductSalePricing::class);
    }

    public function salePricingGroups(): HasMany
    {
        return $this->hasMany(StandardProductSalePricingGroup::class);
    }

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('company_id', $user->IDcompany);
    }

    public static function searchByDesc($search, User $user): Builder
    {
        $products = static::byUser($user);

        if($search) {
            $products->where(function(Builder $q) use ($search) {
                $q->where(DB::raw("CONCAT(standard_products.code , ' ', standard_products.name)"), 'like', '%'.$search.'%')
                    ->orWhere('id', $search);
            })
            ->orderBy(DB::raw("
                CASE
                WHEN CONCAT(standard_products.code , ' ', standard_products.name) LIKE ? THEN 1
                WHEN CONCAT(standard_products.code , ' ', standard_products.name) LIKE ? THEN 2
                WHEN CONCAT(standard_products.code , ' ', standard_products.name) LIKE ? THEN 4
                ELSE 3
                END"
            ))
            ->getQuery()
            ->addBinding($search, 'order')
            ->addBinding($search.'%', 'order')
            ->addBinding('%'.$search, 'order');
        }
        
        return $products;
    }

    public function duplicate($newCode, $prefix)
    {
        $this->loadMissing(['configurationFeatures', 'BOMRules', 'routings']);
        $newProduct = $this->replicate();
        $newProduct->code = $newCode;

        $constraintClonedMap = [];
        $cloneConstraint = function($constraint, $newId) use (&$constraintClonedMap) {
            if(!isset($constraintClonedMap[$constraint->id])) {
                if(Constraint::find($newId)) {
                    throw ValidationException::withMessages(['prefix' => 'The choosen prefix generate duplicated constraint id. Choose a different prefix']);
                }
                $duplicated = $constraint->duplicate($newId);
                if(!$duplicated) {
                    throw new \Exception("Cannot duplicate {$constraint->label} constraint");
                }
                $constraintClonedMap[$constraint->id] = $duplicated;
            }

            return $constraintClonedMap[$constraint->id];
        };

        $saved = DB::transaction(function() use ($newProduct, $prefix, $cloneConstraint) {
            $set = [
                'description_constraint_id',
                'long_description_constraint_id',
                'production_description_constraint_id'
            ];
            foreach($set as $descConstr) {
                if($newProduct->{$descConstr}) {
                    $c = Constraint::find($newProduct->{$descConstr});
                    $newId = $prefix . '_' . $c->id;
                    $duplicated = $cloneConstraint($c, $newId);
                    if(!$duplicated) {
                        throw new \Exception("Cannot duplicate {$c->label} constraint");
                    }
                    $newProduct->{$descConstr} = $duplicated->id;
                }
            }

        
            if(!$newProduct->save()) {
                return false;
            }
            $cfs = $this->configurationFeatures->map(function($e) use ($prefix, $cloneConstraint) {
                $cf = $e->replicate();
                $set = [
                    'validation_constraint_id',
                    'dataset_constraint_id',
                    'activation_constraint_id',
                    'value_constraint_id'
                ];
                foreach($set as $ct) {
                    if($cf->{$ct}) {
                        $c = Constraint::find($cf->{$ct});
                        $newId = $prefix . '_' . $c->id;
                        $duplicated = $cloneConstraint($c, $newId);
                        if(!$duplicated) {
                            throw new \Exception("Cannot duplicate {$c->label} constraint");
                        }
                        $cf->{$ct} = $duplicated->id;
                    }
                }
                
                return $cf;
            });

            $bomRules = $this->BOMRules->map(function($e) use ($prefix, $cloneConstraint) {
                $br = $e->replicate();
                if($br->constraint_id) {
                    $c = Constraint::find($br->constraint_id);
                    $newId = $prefix . '_' . $c->id;
                    $duplicated = $cloneConstraint($c, $newId);
                    if(!$duplicated) {
                        throw new \Exception("Cannot duplicate {$c->label} constraint");
                    }
                    $br->constraint_id = $duplicated->id;
                }

                return $br;
            });

            $routings = $this->routings->map(function($e) use ($prefix, $cloneConstraint) {
                $r = $e->replicate();
                if($r->activation_constraint_id) {
                    $c = Constraint::find($r->activation_constraint_id);
                    $newId = $prefix . '_' . $c->id;
                    $duplicated = $cloneConstraint($c, $newId);
                    if(!$duplicated) {
                        throw new \Exception("Cannot duplicate {$c->label} constraint");
                    }
                    $r->activation_constraint_id = $duplicated->id;
                }

                return $r;
            });

            $newProduct->configurationFeatures()->saveMany($cfs);
            $newProduct->BOMRules()->saveMany($bomRules);
            $newProduct->routings()->saveMany($routings);

           
            $pricings = $this->salePricingGroups->map(function($group) use ($prefix, $newProduct, $cloneConstraint) {
                $g = $group->replicate();
                $g->standard_product_id = $newProduct->id;
                $g->save();
                foreach($group->constraints as $rule) {
                    $r = $rule->replicate();
                    $r->standard_product_sale_pricing_group_id = $g->id;
                    if($r->constraint_id) {
                        $c = Constraint::find($r->constraint_id);
                        $newId = $prefix . '_' . $c->id;
                        $duplicated = $cloneConstraint($c, $newId);
                        if(!$duplicated) {
                            throw new \Exception("Cannot duplicate {$c->label} constraint");
                        }
                        $r->constraint_id = $duplicated->id;
                        $r->save();
                    }
                }

                return $g;
            });

            return $newProduct;
        });

        return $saved;
    }
}
