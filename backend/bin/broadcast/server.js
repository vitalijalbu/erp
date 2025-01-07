import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const pubClient = createClient({ url: process.env.REDIS });
const subClient = pubClient.duplicate();
const redisClient = pubClient.duplicate();


const io = new Server({
    cors: {
        origin: "*",
        credentials: true
    }
});

Promise.all([pubClient.connect(), subClient.connect(), redisClient.connect()]).then(() => {

    io.adapter(createAdapter(pubClient, subClient, {key: process.env.EVENT_PREFIX + 'socket.io'}));
    io.listen(3001);

    io.on("connection", function(socket) {
        socket.on('join_debug', async () => {
            let rooms = await redisClient.sMembers(process.env.EVENT_PREFIX + 'authorize_room_' + socket.id);
            if(rooms.includes('debug')) {
                console.log('join debug room');
                socket.join('debug');
            }
        })
    });

    /*
    io.of("/").adapter.on("join-room", async (room, id) => {
        if(room == 'debug') {
            console.log(await redisClient.sMembers(process.env.EVENT_PREFIX + 'authorize_room_' + id));
        }
    });
    */
});

