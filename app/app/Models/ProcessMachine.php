<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ProcessMachine extends Pivot
{
    protected $casts = [
        'workcenter_default' => 'boolean'
    ];
}
