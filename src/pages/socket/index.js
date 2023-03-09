import socketIOClient from "socket.io-client";
<<<<<<< HEAD
const socket = socketIOClient("http://localhost:4024", {
=======
const socket = socketIOClient("http://localhost:8000", {
>>>>>>> ef8a3691b47e6dda4e2147892c92798f151419a3
  extraHeaders: {
    "Access-Control-Allow-Origin": "*",
  },
});
export default socket;
