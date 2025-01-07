<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Machine extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'machines';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $timestamps = false;

    public $incrementing = false;

    protected $guarded = [
        'company_id'
    ];

    /**
     * Get the workcenter that owns the Machine
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function workcenter(): BelongsTo
    {
        return $this->belongsTo(Workcenter::class, 'workcenter_id', 'id');
    }

    /**
     * Get the cost that owns the Machine
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cost(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'cost_item_id', 'IDitem');
    }

    /**
     * Get the company that owns the Machine
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    public function processes(): BelongsToMany
    {
        return $this->belongsToMany(Process::class, 'machine_id', 'process_id')->using(ProcessMachine::class)->withPivot('workcenter_default');
    }
}
