<?php

namespace App\Models;
use Spatie\Permission\Traits\HasPermissions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class Role extends \Spatie\Permission\Models\Role
{
    use HasFactory, Traits\LogsActivity, HasPermissions {
        permissions as permissionsPermissions;
    }

    protected $fillable = [
        'name',
        'label', 
    ];

    protected $hidden = [
        'guard_name',
        'pivot'
    ];

    protected $casts = [
        'system' => 'boolean',
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::creating(function (Role $role) {
            $role->guard_name = 'web';
            if($role->system === null) {
                $role->system = false;
            }

            return true;
        });

        /**
         * cannot update or delete a system role
         */
        static::updating(function (Role $role) {
            return !$role->system;
        });
        static::deleting(function (Role $role) {
            return !$role->system;
        });
    }

    public function permissions(): BelongsToMany
    {
        return parent::permissions()->using(PermissionRole::class);
    }

}
