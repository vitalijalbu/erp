<?php

namespace App\Models;

use App\Enum\SaleType;
use App\Enum\SaleState;
use App\Helpers\Utility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Spatie\Browsershot\Browsershot;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\Workflow\Marking;
use Symfony\Component\Workflow\Workflow;
use Symfony\Component\Workflow\Transition;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Symfony\Component\Workflow\DefinitionBuilder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Symfony\Component\Workflow\MarkingStore\MarkingStoreInterface;


class Sale extends Model
{
    use HasFactory;

    use Traits\HasCustomId;
    use Traits\LogsActivity;
    use Traits\HasStateTransition;

    protected $guarded = [
        // 'sale_type',
        'state',
        'is_blocked',
        'code',
        'company_id',
        'created_at',
    ];

    public $timezone;

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'delivery_date' => 'date',
        'state' => SaleState::class,
        'sale_type' => SaleType::class,
        'expires_at' => 'date',
        'is_blocked' => 'boolean'
    ];
    
    public $timestamps = false;

    protected static function booted(): void
    {
        parent::booted();

        static::creating(function (Sale $sale) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot create sales outside of a transaction");
            }

            $sale->generateCode();
        });

        static::updating(function (Sale $sale) {
            $sale->bp_id = $sale->getOriginal('bp_id');
        });
    }

    protected function getStateManager()
    {
        $definitionBuilder = new DefinitionBuilder();
        $definition = $definitionBuilder->addPlaces([
                SaleState::inserted->value,
                SaleState::approved->value,
                SaleState::canceled->value,
                SaleState::closed->value
            ])
            ->addTransition(new Transition('approved', 'inserted', 'approved'))
            ->addTransition(new Transition('canceled', 'approved', 'canceled'))
            ->addTransition(new Transition('canceled', 'inserted', 'canceled'))
            ->addTransition(new Transition('closed', 'inserted', 'closed'))
            ->addTransition(new Transition('closed', 'approved', 'closed'))
            ->build();
        
        return $this->makeStateManager($definition, 'state');
    }


    protected function generateCode()
    {
        if($this->saleSequence && $this->created_at instanceof \DateTimeInterface) {
            $this->code = sprintf(
                '%s-%s-%06d', 
                $this->saleSequence->prefix,
                $this->created_at->format('y'),
                $this->saleSequence->getNextCode(Utility::convertDateFromTimezone($this->created_at, 'UTC', $this->timezone, 'Y'))
            );
        }
    }

    public function isExpired()
    {
        if(!$this->expires_at) {
            return false;
        }

        $now = now();
        $now->setTime(0, 0, 0);
        return $this->expires_at < $now;
    }

    public function generateSalePdf()
    {
        if($this->sale_type == SaleType::sale){
            $template = 'pdf.order';
            $email = collect($this->bp->contacts()->wherePivot('order_confirmation', 1)->pluck('email'))->merge($this->bp->shippingMainContact?->email)->filter();
        }else{
            $template = 'pdf.quotation';
            $email = collect($this->bp->contacts()->wherePivot('quotation', 1)->pluck('email'))->merge($this->bp->saleMainContact?->email)->filter();
        }

        $pdf = Browsershot::html(
            view($template.'.body', [
                'sale' => $this,
                'email' => $email->toArray()
        ])->render())
            ->format('A4')
            ->setChromePath('/usr/bin/google-chrome-stable')
            ->noSandbox()
            ->showBrowserHeaderAndFooter()
            ->headerHtml(
                view($template.'.header', ['sale' => $this])->render()
            )
            ->footerHtml(view($template.'.footer')->render())
            ->showBackground()
            ->pdf();
        
        return $pdf;
    }

    public function scopeRequireDiscountApproval(Builder $query, $companyId): void 
    {
        $query->whereIn(
            'id', 
            SaleRow::query()->select('sale_id')->distinct()->where('company_id', $companyId)->where('override_total_discount_to_approve', true)
        );
    }

    public function hasDiscountOverrideToApprove(): bool
    {
        return SaleRow::query()->where('sale_id', $this->id)->where('override_total_discount_to_approve', true)->exists();
    }

    public function getTotalFinalPrice()
    {
        return $this->saleRows()->sum('total_final_price');
    }


    public function saleRows(): HasMany
    {
        return $this->hasMany(SaleRow::class, 'sale_id', 'id');
    }

    public function saleSequence(): BelongsTo
    {
        return $this->belongsTo(SaleSequence::class, 'sale_sequence_id', 'id');
    }

    /**
     * Get the bp that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bp(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'bp_id', 'IDbp');
    }

    /**
     * Get the carrier that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function carrier(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'carrier_id', 'IDbp');
    }

    /**
     * Get the company that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    /**
     * Get the currency that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id', 'id');
    }

    /**
     * Get the company currency that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function companyCurrency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'company_currency_id', 'id');
    }

    /**
     * Get the deliveryTerm that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function deliveryTerm(): BelongsTo
    {
        return $this->belongsTo(DeliveryTerm::class, 'delivery_term_id', 'id');
    }

    /**
     * Get the destinationAddressId that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function destinationAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'destination_address_id', 'id');
    }

    /**
     * Get the invoiceAddressId that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function invoiceAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'invoice_address_id', 'id');
    }

    /**
     * Get the orderType that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function orderType(): BelongsTo
    {
        return $this->belongsTo(OrderType::class, 'order_type_id', 'id');
    }

    /**
     * Get the paymentCode that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_code', 'code');
    }

    /**
     * Get the paymentTerm that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function paymentTerm(): BelongsTo
    {
        return $this->belongsTo(PaymentTerm::class, 'payment_term_code', 'code');
    }

    /**
     * Get the externalContact that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function externalContact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'sales_external_contact_id', 'id');
    }

    /**
     * Get the internalContact that owns the Sale
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function internalContact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'sales_internal_contact_id', 'id');
    }
}
