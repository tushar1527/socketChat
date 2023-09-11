import socketIOClient from "socket.io-client";
const socket = socketIOClient("http://localhost:4026", {
  extraHeaders: {
    "Access-Control-Allow-Origin": "*",
  },
});
export default socket;
