const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const users = require("./socket/users");
// our localhost port
const port = 4001;

const app = express();

// our server instance
const server = http.createServer(app);

// This creates our socket using the instance of the server
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected hello");

  let id;
  socket
    .on("init", async () => {
      id = await users.create(socket);
      console.log("socket init");
      console.log("id", id);
      socket.emit("init", { id });
    })
    .on("request", (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit("request", { from: id });
      }
    })
    .on("call", (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit("call", { ...data, from: id });
      } else {
        socket.emit("failed");
      }
    })
    .on("end", (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit("end");
      }
    })
    .on("disconnect", () => {
      users.remove(id);
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
