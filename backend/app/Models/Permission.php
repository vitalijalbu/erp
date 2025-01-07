<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Permission extends \Spatie\Permission\Models\Permission
{
    use HasFactory;

    protected $fillable = [
        'name',
        'label', 
        'created_at',
        'updated_at',
    ];

    protected $hidden = [
        'guard_name',
        'pivot'
    ];
}
