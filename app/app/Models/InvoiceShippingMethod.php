<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceShippingMethod extends Model
{
    use HasFactory;

    protected $table = 'invoice_shipping_methods';

    public $timestamps = false;

    protected $keyType = 'string';

    public $incrementing = false;

    public $primaryKey = 'code';
}
