<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderType extends Model
{
    use HasFactory;

    protected $table = 'order_types';

    public $timestamps = false;

    protected $keyType = 'string';

    public $incrementing = false;
}
