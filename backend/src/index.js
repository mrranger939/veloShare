import app from "./app.js";
import { config } from "./config/index.js";
import {createServer} from "http";
import {Server} from "socket.io";

const PORT = config.PORT;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map();

io.on("connection", (socket)=>{
  console.log("Socket connected: ", socket.id);

  socket.on("create-room", ()=>{
    const roomId = Math.random().toString(36).substring(2,8);
    rooms.set(roomId, [socket.id]);
    socket.join(roomId);
    socket.emit("room-created", roomId);
    console.log("room-created", roomId);
  })

  socket.on("join-room", (roomId)=>{
    const room = rooms.get(roomId);
    if(!room) {
      socket.emit("error-message", "Room not found");
      return;
    }
    if(room.length >= 2) {
      socket.emit("error-message", "Room is full");
      return;
    }
    room.push(socket.id);
    socket.join(roomId);
    socket.emit("room-joined", roomId);
    socket.to(roomId).emit("peer-joined");
    console.log("Joined room:", roomId);
  })

  socket.on("offer", ({roomId, offer})=>{
    socket.to(roomId).emit("offer", {roomId,offer});
  })

  socket.on("answer", ({roomId, answer})=>{
    socket.to(roomId).emit("answer", {roomId, answer});
  })

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", {roomId, candidate});
  })

  socket.on("disconnect", ()=>{
    for (const [roomId, sockets] of rooms) {
      if (sockets.includes(socket.id)) {
        rooms.delete(roomId);
        socket.to(roomId).emit("peer-disconnected");
      }
    }
    console.log("Disconnected", socket.id);
  })

});



httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
