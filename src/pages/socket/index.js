import socketIOClient from "socket.io-client";
const socket = socketIOClient("http://localhost:4024", {
  extraHeaders: {
    "Access-Control-Allow-Origin": "*",
  },
});
export default socket;
