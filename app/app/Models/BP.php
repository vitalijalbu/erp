<?php

namespace App\Models;

use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class BP extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    use Traits\LogsActivity;

    protected $table = 'bp';

    protected $primaryKey = 'IDbp';

    public $timestamps = false;

    protected $casts = [
        'supplier' => 'boolean',
        'customer' => 'boolean',
        'is_sales' => 'boolean',
        'is_shipping' => 'boolean',
        'is_invoice' => 'boolean',
        'is_purchase' => 'boolean',
        'is_blocked' => 'boolean',
        'is_carrier' => 'boolean',
        'is_active' => 'boolean',
        'sales_has_chiorino_stamp' => 'boolean',
    ];

    public $fillable = [
        'desc',
        'supplier',
        'customer',
        'address_id',
        'contact_id',
        'language',
        'business_registry_registration',
        'vat',
        'currency_id',
        'bp_category_id',
        'naics_l1',
        'naics_l2',
        'naics_l3',
        'sales_currency_id',
        'is_sales',
        'is_shipping',
        'is_invoice',
        'is_purchase',
        'is_blocked',
        'is_carrier',
        'sales_internal_contact_id',
        'sales_external_contact_id',
        'sales_document_language_id',
        'shipping_carrier_id',
        'shipping_document_language_id',
        'is_active',
        'sales_address_id',
        'sales_contact_id',
        'sales_has_chiorino_stamp',
        'shipping_address_id',
        'shipping_contact_id',
        'sales_order_type_id',
        'shipping_delivery_term_id',
        'purchase_address_id',
        'purchase_contact_id',
        'purchase_currency_id',
        'purchase_payment_term_id',
        'purchase_payment_method_id',
        'purchase_document_language_id',
        'invoice_address_id',
        'invoice_contact_id',
        'invoice_payment_term_id',
        'invoice_payment_method_id',
        'invoice_shipping_method_id',
        'invoice_document_language_id',
        'group_id'
    ];


    protected static function booted(): void
    {
        parent::booted();

        static::saving(function(BP $bp){
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot sabe BP outside of a transaction");
            }

            if($bp->isDirty('is_blocked')) {
                $bp->lockAllOrders($bp->is_blocked);
            }            
        });

        static::updating(function (BP $bp) {
            if($bp->isDirty('is_carrier') && !$bp->is_carrier){
                BP::where('shipping_carrier_id', $bp->id)
                    ->update(['shipping_carrier_id' => null]);
            }
        });
    }

    public function lockAllOrders($lock)
    {
        $this->sales()->where('sale_type', 'sale')->update(['is_blocked' => $lock]);
    }


    /**
     * Get the company that owns the BP
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the bpDestinations for the BP
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function bpDestinations(): HasMany
    {
        return $this->hasMany(BPDestination::class, 'IDbp', 'IDbp');
    }

    /**
     * Get all of the lots for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lots(): HasMany
    {
        return $this->hasMany(Lot::class, 'IDbp', 'IDbp');
    }

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('IDcompany', $user->IDcompany);
    }

    public function scopeIsSuppliers(Builder $query): void
    {
        $query->where('customer', 0)->where('supplier', 1);
    }

    public function scopeIsCustomers(Builder $query): void
    {
        $query->where('customer', 1)->where('supplier', 0);
    }

    /**
     * The contacts that belong to the BP
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'bp_contact', 'bp_id', 'contact_id')
            ->using(BPContact::class)
            ->withPivot([
                'quotation',
                'order_confirmation',
                'billing',
                'delivery_note',
            ]);
    }

    public function mainContact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'contact_id', 'id');
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'address_id', 'id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id', 'id');
    }

    /**
     * The addresses that belong to the BP
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function addresses(): BelongsToMany
    {
        return $this->belongsToMany(Address::class, 'bp_addresses', 'bp_id', 'address_id')
            ->using(BPAddress::class)
            ->withPivot([
                'is_sales',
                'is_shipping',
                'is_invoice',
                'is_purchase',
            ]);
    }

    /**
     * Get the BPCategory that owns the BP
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bpCategory(): BelongsTo
    {
        return $this->belongsTo(BPCategory::class, 'bp_category_id', 'id');
    }

    /**
     * Get all of the bankAccounts for the BP
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function bankAccounts(): HasMany
    {
        return $this->hasMany(BankAccount::class, 'bp_id', 'IDbp');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'bp_id', 'IDbp');
    }

    public function saleMainContact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'sales_contact_id', 'id');
    }

    public function shippingMainContact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'shipping_contact_id', 'id');
    }
}
