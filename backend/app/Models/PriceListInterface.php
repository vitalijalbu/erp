<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

interface PriceListInterface
{
    public function rows(): HasMany;

    public function getMatchingRow(Item $item, $quantity, $width = null);
}