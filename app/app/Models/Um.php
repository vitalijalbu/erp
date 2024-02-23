<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Um extends Model
{
    use HasFactory;

    protected $table = 'um';
    
    protected $primaryKey = 'IDdim';
    
    protected $fillable = [
        'desc',
        'frazionabile',
        'decimal_on_stock_qty',
    ];
    
    public $timestamps = false;

    public $incremental = false;

    public $keyType = 'string';

    public $casts = [
        'frazionabile' => 'integer',
        'decimal_on_stock_qty' => 'integer'
    ];

    public function umDimensions(): HasMany
    {
        return $this->HasMany(UmDimension::class, 'IDdim', 'IDdim');
    }

}
