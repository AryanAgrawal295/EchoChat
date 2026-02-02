import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express();
const server = http.createServer(app)

const io = new Server(server, {
    cors:{
        origin: "http://localhost:5173"
    }
})

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}


io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId
    if(userId) userSocketMap[userId] = socket.id

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=> {
        console.log("A user is disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// When a client runs io(BASE_URL) (on your frontend), it:
// 1️⃣ Opens a connection request to your server.
// 2️⃣ The Server (io) detects this and fires the "connection" event.
// 3️⃣ That’s why io.on("connection", ...) runs automatically — because a new client just connected.

export {io, app, server}