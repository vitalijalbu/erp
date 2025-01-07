<?php

namespace App\Console\Commands;

use App\Models\ItemLine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncItemsLinesFromLn extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-items-lines-from-ln';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync items lines from LN';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        DB::transaction(function(){
            $res = DB::connection('ln')
                ->table('ttcmcs061815')
                ->get();
                
            foreach($res as $row){
                ItemLine::updateOrCreate([
                    'code' => $row->t_cpln], [
                    'description' => $row->t_dsca,
                    'company_id' => 0
                ]);
            }
        });
    }
}
