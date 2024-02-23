<?php

namespace App\Console\Commands;

use App\Models\NaicsCode;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;


class SyncNaicsCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-naics-codes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync NAICS code definitions from LN datatabase';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        DB::beginTransaction();

        $level1Codes = DB::connection('ln')
            ->table('dbo.ttcchi007815')
            ->get();

        $level1Codes = $level1Codes->map(fn($row) => [
                'id' => $row->t_cod1,
                'description' => $row->t_dsca,
                'level' => 1
            ])
            ->toArray();
            
        NaicsCode::upsert($level1Codes, ['id'], ['description']);
        NaicsCode::where('level', 1)->whereNotIn('id', array_column($level1Codes, 'id'))->delete();

        $level2Codes = DB::connection('ln')
            ->table('dbo.ttcchi008815')
            ->get();

        $level2Codes = $level2Codes->map(fn($row) => [
                'id' => $row->t_cod1 . '-' . $row->t_cod2,
                'description' => $row->t_dsca,
                'level' => 2,
                'parent_id' => $row->t_cod1,
            ])
            ->toArray();

        NaicsCode::upsert($level2Codes, ['id'], ['description']);
        NaicsCode::where('level', 2)->whereNotIn('id', array_column($level2Codes, 'id'))->delete();

        $level3Codes = DB::connection('ln')
            ->table('dbo.ttcchi009815')
            ->get();

        $level3Codes = $level3Codes->map(fn($row) => [
                'id' => $row->t_cod1 . '-' . $row->t_cod2 . '-' . $row->t_cod3,
                'description' => $row->t_dsca,
                'level' => 3,
                'parent_id' => $row->t_cod1 . '-' . $row->t_cod2
            ])
            ->toArray();

        NaicsCode::upsert($level3Codes, ['id'], ['description']);
        NaicsCode::where('level', 3)->whereNotIn('id', array_column($level3Codes, 'id'))->delete();

        DB::commit();
    }
}
