<?php

namespace App\Broadcasting;

class BroadcastManager {

    public static function getEmitter(): \SocketIO\Emitter
    {
        return app(\SocketIO\Emitter::class);
    }

    public static function authorizeRoom($socketId, $room)
    {
        $client = app('redis')->connection();
        $client->sadd('authorize_room_'.$socketId, $room);
        $client->expire('authorize_room_'.$socketId, 3600);
    }
}