<?php

namespace App\Enum;

enum ItemType: string {
    case product = 'product';
    case purchased = 'purchased';
    case service = 'service';
    case cost = 'cost';
}