<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class Constraint extends Model
{
    use HasFactory;
    use Traits\LogsActivity;

    protected $table = 'constraints';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    public $fillable = [
        'id',
        'label',
        'description',
        'body',
        'constraint_type_id',
        'subtype',
        'is_draft',
        'company_id'
    ];

    protected $casts = [
        'body' => 'array',
        'dependencies' => 'array',
        'is_draft' => 'boolean'
    ];

    protected static function booted(): void
    {
        static::saving(function (Constraint $constraint) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save constraints outside of a transaction");
            }

            if($constraint->constraintType->require_company) {
                if(ProductBOMRule::where('constraint_id', $constraint->id)->whereHas('standardProduct', function(Builder $query) use ($constraint) {
                    $query->where('company_id', '<>', $constraint->company_id);
                })->exists()) {
                    throw ValidationException::withMessages(['company_id' => 'Cannot change the company associated to this constraint because already in use']);
                }
            }

            $uuid = "_" . Str::ascii(Str::slug($constraint->id, '_')) . "_" . Str::ulid();
            $constraint->uuid = $uuid;

            $constraint->dependencies = $constraint->extractDependencies();
        });

        static::saved(function (Constraint $constraint) {
            if(!$constraint->is_draft) {
                $constraint->generateCode();
            }
        });

        static::deleted(function (Constraint $constraint) {
            if(!$constraint->is_draft) {
                $codeStorage = app()->make(\App\Configurator\Conversion\CodeRepositoryInterface::class);
                $codeStorage->deleteCode($constraint->uuid);
            }
        });
    }

    public function generateCode() {
        $converter = app()->make(\App\Configurator\Conversion\ConverterInterface::class);
        $codeStorage = app()->make(\App\Configurator\Conversion\CodeRepositoryInterface::class);
        $code = $converter->convertConstraint($this);
        $codeStorage->storeCode($this->uuid, $code);
    }

    public function extractDependencies(): array
    {
        $converter = app()->make(\App\Configurator\Conversion\ConverterInterface::class);
        $deps = $converter->extractDependencies($this);

        return $deps;
    }

    public function canChangeSubtype(): bool
    {
        if($this->constraint_type_id == 'configurator') {
            return !ProductConfigurationFeature::where('activation_constraint_id', $this->id)
                ->orWhere('validation_constraint_id', $this->id)
                ->orWhere('value_constraint_id', $this->id)
                ->orWhere('dataset_constraint_id', $this->id)
                ->exists();
        }
        return true;
    }

    public function constraintType(): BelongsTo
    {
        return $this->belongsTo(ConstraintType::class, 'constraint_type_id', 'id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    public function duplicate($newId)
    {
        $newConstraint = $this->replicate();
        $newConstraint->id = $newId;

        return  DB::transaction(function() use ($newConstraint) {
            return $newConstraint->save() ? $newConstraint : false;
        });
    }
}
