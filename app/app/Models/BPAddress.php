<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;


class BPAddress extends Pivot
{
    use Traits\LogsActivity;
}
