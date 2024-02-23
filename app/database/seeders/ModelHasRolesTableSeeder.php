<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class ModelHasRolesTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('model_has_roles')->delete();
        DB::statement("INSERT INTO model_has_roles SELECT roles.id, 'App\Models\User', users.id FROM users INNER JOIN roles ON roles.name = 'admin'");
        
    }
}