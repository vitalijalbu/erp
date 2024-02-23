<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompanyTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('company')->delete();
        
        DB::table('company')->insert(array (
            0 => 
            array (
                'IDcompany' => '0',
                'desc' => 'Chiorino shared',
                'curr' => 'ZZZ',
                'lot_code' => 'ZZ',
                'LN_bpid_code' => 'ZZZZZZZZ ',
                'CSM_bpid_code' => NULL,
                'logo_on_prints' => 'img/logoChiorino_50_7.jpg',
                'read_alternative_item_code' => '0',
            ),
            1 => 
            array (
                'IDcompany' => '845',
                'desc' => 'Chiorino FR',
                'curr' => 'EUR',
                'lot_code' => 'FR',
                'LN_bpid_code' => 'BP0000060',
                'CSM_bpid_code' => NULL,
                'logo_on_prints' => 'img/logoChiorino_50_7.jpg',
                'read_alternative_item_code' => '0',
            ),
        ));
        
        
    }
}