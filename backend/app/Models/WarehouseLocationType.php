<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


class WarehouseLocationType extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    
    protected $table = 'warehouse_location_type';
    
    protected $primaryKey = 'IDwh_loc_Type';
    
    protected $fillable = [
        'tname',
        'tdesc',
        'evaluated',
    ];
    
    public $timestamps = false;
    
    public function warehouseLocations(): HasMany
    {
        return $this->HasMany(WarehouseLocation::class, 'IDwh_loc_Type', 'IDwh_loc_Type');
    }
}
