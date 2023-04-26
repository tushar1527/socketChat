const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const users = require("./socket/users");
// our localhost port
const port = 4025;

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
  let id;
  socket
    // .on("init", (room) => {
    //   console.log("room", room);
    //   socket.join(room.drId);
    //   socket.join(room.patientId);
    // })
    .on("request", async (data) => {
      let dataResponse = await chatRoomController.sendSocketMessage(data);
      socket.emit(data.roomId, dataResponse);
      socket.broadcast.emit(data.roomId, dataResponse);
    })
    .on("init", async (data) => {
      socket.join(data.userId);
      socket.broadcast.emit(data.room, {
        channel: "init",
        room: {
          roomId: data.room,
          from: data.userId,
        },
      });
      console.log("data", data);
    })
    .on("requestCall", (data) => {
      console.log("requestCall", data);
      socket.broadcast.emit(data.room, {
        channel: "callFrom",
        room: data,
      });
    })
    .on("call", (data) => {
      console.log("data", data);
      socket.broadcast.emit(data.to, {
        channel: "startCall",
        room: data,
      });
    })
    .on("screenShare", (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        console.log("screenShare");
        receiver.emit("screenShare", { ...data, from: id });
      } else {
        console.log("failed", failed);
        socket.emit("failed");
      }
    })
    .on("reTransform", (data) => {
      console.log("reTransform", data);
      // const receiver = users.get(data.to);
      // const sender = users.get(data.me);
      // console.log("data.me", data.me);
      // console.log("screenShare");
      // if (receiver) {
      //   receiver.emit("reTransform", { ...data, from: data.me });
      // } else if (sender) {
      //   console.log("retransform");
      //   sender.emit("reTransform", { ...data, me: data.me, from: data.to });
      // } else {
      //   console.log("failed", failed);
      //   socket.emit("failed");
      // }
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
