<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeatureTypesTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('feature_types')->delete();
        
        DB::table('feature_types')->insert([
            [
                'id' => 'bool',
                'label' => 'Yes / No',
            ],
            [
                'id' => 'decimal',
                'label' => 'Decimal Number',
            ],
            [
                'id' => 'dropdown',
                'label' => 'Dropdown',
            ],
            [
                'id' => 'int',
                'label' => 'Integer Number',
            ],
            [
                'id' => 'product',
                'label' => 'Product Selection',
            ],
            [
                'id' => 'text',
                'label' => 'Text',
            ],
        ]);
        
        
    }
}