<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeightUm extends Model
{
    use HasFactory;

    protected $table = 'weights_um';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $incremental = false;

    public $keyType = 'string';

    public $fillable = [
        'id',
        'label',
    ];
}
