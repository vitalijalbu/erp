<?php

use App\Models\ContactType;
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
        Schema::create('contact_types', function(Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->string('name', 100);
        });

        ContactType::insert([
            ['name' => 'Sales'],
            ['name' => 'Shipping'],
            ['name' => 'Administrative'],
            ['name' => 'Billing'],
            ['name' => 'CEO'],
        ]);

        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn('surname');
            $table->string('type', 100)->default('person');
            $table->text('note')->nullable();
            $table->dropColumn('qualification');
            $table->integer('contact_type_id')->nullable();
            $table->boolean('is_employee')->default(false);

            $table->foreign('contact_type_id')->references('id')->on('contact_types');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('contact_type_id');
            $table->string('surname', 100);
            $table->dropColumn('type');
            $table->dropColumn('note');
            $table->string('qualification', 100);
            $table->dropColumn('is_employee');
        });

        Schema::dropIfExists('contact_types');
    }
};
