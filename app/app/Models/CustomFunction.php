<?php

namespace App\Models;

use App\Configurator\Exception\UndeletableFunctionException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;


class CustomFunction extends Model
{
    use HasFactory;
    use Traits\LogsActivity;

    protected $table = 'custom_functions';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = "string";

    public $timestamps = false;

    public $fillable = [
        'id',
        'label',
        'description',
        'arguments',
        'body',
        'custom_function_category_id',
    ];

    protected $casts = [
        'arguments' => 'array',
        'body' => 'array',
        'dependencies' => 'array'
    ];

    protected static function booted(): void
    {
        static::saving(function (CustomFunction $function) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save custom functions outside of a transaction");
            }

            $uuid = "_" . Str::ascii(Str::slug($function->id, '_')) . "_" . Str::ulid();
            $function->uuid = $uuid;

            $function->dependencies = $function->extractDependencies();
        });

        static::deleting(function (CustomFunction $function) {
            $functionRefs = CustomFunction::whereJsonContains('dependencies', $function->id)->count();
            $constraintRefs = Constraint::whereJsonContains('dependencies', $function->id)->count();
            if($functionRefs || $constraintRefs) {
                throw new UndeletableFunctionException("Cannot delete the function because is used in some constraints or custom functions");
            }
        });

        static::saved(function (CustomFunction $function) {
            $function->generateCode();
        });

        static::deleted(function (CustomFunction $function) {
            $codeStorage = app()->make(\App\Configurator\Conversion\CodeRepositoryInterface::class);
            $codeStorage->deleteCode($function->uuid);
        });
    }

    public function customFunctionCategory(): BelongsTo
    {
        return $this->belongsTo(CustomFunctionCategory::class, 'custom_function_category_id', 'id');
    }

    public function generateCode() 
    {
        $converter = app()->make(\App\Configurator\Conversion\ConverterInterface::class);
        $codeStorage = app()->make(\App\Configurator\Conversion\CodeRepositoryInterface::class);
        $code = $converter->convertFunction($this);
        $codeStorage->storeCode($this->uuid, $code);
    }

    public function extractDependencies(): array
    {
        $converter = app()->make(\App\Configurator\Conversion\ConverterInterface::class);
        $deps = $converter->extractDependencies($this);

        return $deps;
    }
    
}
