import express from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import cors from "cors";
import "dotenv/config";

import { router } from "./routes.js";
import { socketState } from "./state.js";
import { LoggerCls } from "./utils/logger.js";

//------ Constants
const PORT = process.env.API_PORT || 3001;
const API_PREFIX = "/api";
//------

const app = express();
app.use(cors()); // express cors middleware

const httpServer = http.createServer(app);

//------ Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
  },
});

io.on("connection", (socket: Socket) => {
  LoggerCls.info("New client connected " + socket.id);
  if (!socketState[socket.id]) {
    socketState[socket.id] = {};
  }
  socketState[socket.id].socketClient = socket;

  socket.on("disconnect", () => {
    LoggerCls.info("Client disconnected " + socket.id);
    delete socketState[socket.id];
  });

  // socket.emit("importStats", { processed: 0, failed: 0, totalFiles: 0 });
});
//------

app.use(express.json());

app.use(API_PREFIX, router);

httpServer.listen(PORT, () => {
  LoggerCls.info(`Server running on port ${PORT}`);
});
