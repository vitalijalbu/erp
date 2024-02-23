<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogSyncErplndb extends Model
{
    use HasFactory;

    protected $table = 'log_sync_erplndb';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'sync_at',
        'sync_table',
        'sync_table_source',
        'sync_msg',
        'sync_errmsg',
        'sync_code',
        'sync_sel',
        'sync_del',
        'sync_ins',
        'sync_time',
    ];
}
