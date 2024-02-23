<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class CustomFunctionCategory extends Model
{
    use HasFactory;
    use Traits\LogsActivity;

    protected $table = 'custom_function_categories';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'name',
        'parent_id',
    ];

    protected static function booted(): void
    {
        static::saving(function (CustomFunctionCategory $category) {
            if($category->parent_id !== null && $category->parent_id == $category->id) {
                return false; //paradox
            }
        });
    }

    public function customFunctions(): HasMany
    {
        return $this->hasMany(CustomFunction::class, 'custom_function_category_id', 'id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(static::class, 'parent_id', 'id');
    }

    public function directChildren(): HasMany
    {
        return $this->hasMany(static::class, 'parent_id', 'id')
            ->orderBy('name', 'asc');
    }

    public function parents(): BelongsTo
    {
        return $this->belongsTo(static::class, 'parent_id', 'id')->with('parents');
    }

    public function children(): HasMany
    {
        return $this->hasMany(static::class, 'parent_id', 'id')
            ->with('children')
            ->orderBy('name', 'asc');
    }

    
    
}
