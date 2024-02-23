<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleHasPermissionsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('role_has_permissions')->delete();

        DB::statement("INSERT INTO role_has_permissions SELECT roles.id, permissions.id FROM permissions INNER JOIN roles ON (roles.name = 'admin')");
    }
}