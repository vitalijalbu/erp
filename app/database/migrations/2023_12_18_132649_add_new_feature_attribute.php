<?php

use App\Models\FeatureAttribute;
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
        FeatureAttribute::create([
            'id' => 'service_item',
            'name' => 'Service Item',
            'multiple' => false,
            'order' => 40
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $serviceItem = FeatureAttribute::find('service_item');
        if($serviceItem) {
            $serviceItem->delete();
        }
    }
};
