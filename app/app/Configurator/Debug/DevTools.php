<?php

namespace App\Configurator\Debug;

use App\Broadcasting\BroadcastManager;

class DevTools {

    public static function emitFullDebug($status, $debug)
    {
        $emitter = BroadcastManager::getEmitter();
        $emitter->to('debug')->broadcast->emit('debug', ['status' => $status, 'data' => $debug]);
    }

    public static function emit($type, $status, $data) {
        $emitter = BroadcastManager::getEmitter();
        $emitter->to('debug')->broadcast->emit('debug', ['status' => $status, 'data' => [$type => $data]]);
    }
}