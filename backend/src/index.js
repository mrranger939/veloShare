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

const devices = new Map();

io.on("connection", (socket)=>{
  console.log("New device connected: ", socket.id);

  socket.on("register-device", (deviceName)=>{
    devices.set(socket.id, deviceName);
    console.log("Registered: ", deviceName);

    io.emit("device-list", Array.from(devices.values()));
  });

  socket.on("disconnect", ()=>{
    const name = devices.get(socket.id);
    devices.delete(socket.id);
    console.log("Disconnected: ", name);

    io.emit("device-list", Array.from(devices.values()));
  });
});



httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
