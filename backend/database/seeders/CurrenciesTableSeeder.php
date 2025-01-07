<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurrenciesTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('currencies')->delete();
        
        DB::table('currencies')->insert(array (
            0 => 
            array (
                'id' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
            ),
            1 => 
            array (
                'id' => 'GBP',
                'name' => 'Pounds',
                'symbol' => '£',
            ),
            2 => 
            array (
                'id' => 'USD',
                'name' => 'Dollars',
                'symbol' => '$',
            ),
        ));
        
        
    }
}