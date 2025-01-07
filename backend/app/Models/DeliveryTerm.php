<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryTerm extends Model
{
    use HasFactory;

    protected $table = 'delivery_terms';

    public $timestamps = false;

    protected $keyType = 'string';

    public $incrementing = false;
}
