import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

// store online users
const userSocketMap = {}; // { userId: socketId }

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://echo-chat-second.vercel.app",
      "https://echo-chat-second-git-main-aryanagrawal295s-projects.vercel.app"
    ],
    credentials: true,
  },
});

/* 🔐 SOCKET AUTH MIDDLEWARE */
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  userSocketMap[socket.userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
    delete userSocketMap[socket.userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, app, server };


// import { Server } from "socket.io"
// import http from "http"
// import express from "express"

// const app = express();
// const server = http.createServer(app)

// const io = new Server(server, {
//     cors:{
//         origin: "http://localhost:5173"
//     }
// })

// export function getReceiverSocketId(userId) {
//     return userSocketMap[userId];
// }

// // used to store online users
// const userSocketMap = {}; // {userId: socketId}


// io.on("connection", (socket) => {
//     console.log("A user connected", socket.id);

//     const userId = socket.handshake.query.userId
//     if(userId) userSocketMap[userId] = socket.id

//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//     socket.on("disconnect", ()=> {
//         console.log("A user is disconnected", socket.id);
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });
// });

// // When a client runs io(BASE_URL) (on your frontend), it:
// // 1️⃣ Opens a connection request to your server.
// // 2️⃣ The Server (io) detects this and fires the "connection" event.
// // 3️⃣ That’s why io.on("connection", ...) runs automatically — because a new client just connected.

// export {io, app, server}