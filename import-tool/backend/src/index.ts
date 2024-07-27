import express from "express";
import { Server } from "socket.io";
import http from "http";
import "dotenv/config";

import { router } from "./routes";

//------ Constants
const PORT = process.env.API_PORT || 3001;
const API_PREFIX = "/api";
//------

const app = express();
const httpServer = http.createServer(app);

//------ Socket.io
const socketClients: { [key: string]: any } = {};
const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log("New client connected " + socket.id);
  socketClients[socket.id] = socket;

  socket.on("disconnect", () => {
    console.log("Client disconnected " + socket.id);
    delete socketClients[socket.id];
  });

  // socket.emit("update", { processed: 0, failed: 0, total: 0 });
});
//------

app.use(express.json());

app.use(API_PREFIX, router);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
