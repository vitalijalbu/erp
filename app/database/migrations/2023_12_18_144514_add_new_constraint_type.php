<?php

use App\Models\ConstraintType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        ConstraintType::create([
            'id' => 'price',
            'label' => 'Pricing Constraint',
            'require_subtype' => false,
            'require_company' => false
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $priceConstraints = ConstraintType::dinf('price');
        if($priceConstraints) {
            $priceConstraints->delete();
        }
    }
};
