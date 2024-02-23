<?php

namespace App\Console\Commands;

use App\Models\ItemSubfamily;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncItemsSubfamiliesFromLn extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-items-subfamilies-from-ln';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync items subfamilies from LN';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        DB::transaction(function(){
            $res = DB::connection('ln')
                ->table('ttcmcs023815')
                ->get();

            foreach($res as $row){
                ItemSubfamily::updateOrCreate([
                    'code' => $row->t_citg], [
                    'description' => $row->t_dsca,
                    'company_id' => 0
                ]);
            }
        });
    }
}
