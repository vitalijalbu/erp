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
        Schema::create('items_subfamilies', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->integer('company_id');
            $table->string('code', 100);
            $table->string('description', 255);
            // $table->timestamps();

            $table->foreign('company_id')->references('IDcompany')->on('company');
        });

        $this->createTrigger('items_subfamilies', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items_subfamilies');

        $this->deleteTrigger('items_subfamilies');
    }
};
