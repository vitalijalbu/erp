<?php

use App\Models\Traits\TriggerMigration;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    use TriggerMigration;
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('standard_joins', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('guide_type', 255);
            $table->boolean('item_yes_no')->default(0);
            $table->integer('company_id');

            $table->foreign('company_id')->on('company')->references('IDcompany');

        });
        $this->createTrigger('standard_joins', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('standard_joins');

        $this->deleteTrigger('standard_joins');
    }
};
