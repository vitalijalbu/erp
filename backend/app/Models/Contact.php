<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Contact extends Model
{
    use HasFactory;
    use HasCustomId;
    use Traits\LogsActivity;

    protected $table = 'contacts';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $casts = [
        'is_employee' => 'bool'
    ];

    public $fillable = [
        'type',
        'name',
        'department',
        'address_id',
        'office_phone',
        'mobile_phone',
        'email',
        'language',
        'company_id',
        'contact_type_id',
        'is_employee',
        'note'
    ];

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'address_id', 'id');
    }
    
    /**
     * The bp that belong to the Contact
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function bp(): BelongsToMany
    {
        return $this->belongsToMany(BP::class, 'bp_contact', 'contact_id', 'bp_id')
            ->withPivot([
                'quotation',
                'order_confirmation',
                'billing',
                'delivery_note',
            ]);
    }

    public function contactType(): BelongsTo
    {
        return $this->belongsTo(ContactType::class, 'contact_type_id', 'id');
    }

    public static function getAvailableTypes()
    {
        return [
            'person' => 'Person',
            'business' => 'Business'
        ];
    }

    protected static function booted(): void
    {
        parent::booted();

        static::updating(function (Contact $contact) {
            if($contact->isDirty('is_employee') && !$contact->is_employee){
                BP::where('sales_internal_contact_id', $contact->id)
                    ->update(['sales_internal_contact_id' => null]);

                BP::where('sales_external_contact_id', $contact->id)
                    ->update(['sales_external_contact_id' => null]);

                User::where('employee_contact_id', $contact->id)
                    ->update(['employee_contact_id' => null]);
            }
        });
    }
}
