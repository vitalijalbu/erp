<?php

namespace App\Enum;

enum SaleType: string {
    case quotation = 'quotation';
    case sale = 'sale';
}