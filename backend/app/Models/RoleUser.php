<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Relations\MorphPivot;
 
class RoleUser extends MorphPivot
{
    use Traits\LogsActivity;
}