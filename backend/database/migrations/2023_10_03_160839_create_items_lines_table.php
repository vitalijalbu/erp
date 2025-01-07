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
        Schema::create('items_lines', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->integer('company_id');
            $table->string('code', 100);
            $table->string('description', 255);
            // $table->timestamps();

            $table->foreign('company_id')->references('IDcompany')->on('company');
        });

        $this->createTrigger('items_lines', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items_lines');

        $this->deleteTrigger('items_lines');
    }
};
