<?php

use App\Models\DocumentLanguage;
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
        Schema::create('document_languages', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('label', 255);
        });

        DocumentLanguage::insert([
            ['id' => 'it', 'label' => 'italian'],
            ['id' => 'en', 'label' => 'english'],
        ]);

        Schema::table('bp', function(Blueprint $table) {
            $table->foreign('shipping_document_language_id')->references('id')->on('document_languages');
            $table->foreign('sales_document_language_id')->references('id')->on('document_languages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_languages');
    }
};
