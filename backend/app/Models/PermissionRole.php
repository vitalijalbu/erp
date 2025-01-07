<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Relations\MorphPivot;
 
class PermissionRole extends MorphPivot
{
    use Traits\LogsActivity;
}