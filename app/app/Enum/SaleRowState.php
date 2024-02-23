<?php

namespace App\Enum;

enum SaleRowState: string {
    case active = 'active';
    case closed = 'closed';
    case canceled = 'canceled';
}