<?php

use Illuminate\Support\Facades\Schema;
use App\Models\Traits\TriggerMigration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    use TriggerMigration;
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bp_groups', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->integer('company_id');
            $table->string('name', 255);

            $table->foreign('company_id')->references('IDcompany')->on('company');
        });

        $this->createTrigger('bp_groups', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bp_groups');

        $this->deleteTrigger('bp_groups');
    }
};
