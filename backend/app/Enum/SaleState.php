<?php

namespace App\Enum;

enum SaleState: string {
    case inserted = 'inserted';
    case approved = 'approved';
    case canceled = 'canceled';
    case closed = 'closed';
}