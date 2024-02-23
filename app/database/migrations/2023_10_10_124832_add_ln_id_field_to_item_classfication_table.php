<?php

use App\Models\ItemClassification;
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
        Schema::table('item_classifications', function (Blueprint $table) {
            $table->addColumn('integer', 'ln_id')->nullable();
        });

        $classifications = [
            'dp' => 3,
            'exclusive' => 5,
            'not_applicable' => 4,
            'not_applicable_l2' => 4,
            'not_standard' => 2,
            'restricted' => 3,
            'special' => 1, 
            'standard' => 1,
            'tailor_made' => 2,
        ];

        foreach($classifications as $classification => $lnId) {
            $classification = ItemClassification::find($classification);
            $classification->ln_id = $lnId;
            $classification->save();
        } 
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_classfication', function (Blueprint $table) {
            $table->dropColumn(('ln_id'));
        });
    }
};
