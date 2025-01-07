<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Spatie\Activitylog\LogOptions;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles {
        roles as permissionRoles;
    }
    use Traits\LogsActivity;

    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'IDcompany',
        'username',
        'IDgroup',
        'language',
        'IDwarehouseUserDef',
        'clientTimezoneDB',
        'decimal_symb',
        'list_separator',
        'employee_contact_id',
        'default_workcenter'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    
    public $timestamps = false;

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }
    
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'IDwarehouseUserDef', 'IDwarehouse');
    }

    public function roles(): MorphToMany
    {
        return $this->permissionRoles()->using(RoleUser::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'employee_contact_id', 'id');
    }

    protected function isAuthorized(): Attribute
    {
        return new Attribute(
            get: fn () => $this->getAllPermissions()->pluck('name'),
        );
    }

    protected function defaultWarehouseLocationId(): Attribute
    {
        return new Attribute(
            get: function() {
                if($this->IDwarehouseUserDef) {
                    $default = WarehouseLocation::query()
                        ->select(['IDlocation'])
                        ->where('IDwarehouse', $this->IDwarehouseUserDef)
                        ->orderBy('DefaultLoadLocPerWh', 'DESC')
                        ->first();

                    if($default) {
                        return $default->IDlocation;
                    }
                }
                return null;
            },
        );
    }

}
