<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;


class BPContact extends Pivot
{
    use Traits\LogsActivity;
}
