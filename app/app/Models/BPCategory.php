<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BPCategory extends Model
{
    use HasFactory;

    protected $table = 'bp_categories';

    public $timestamps = false;

    protected $keyType = 'string';

}
