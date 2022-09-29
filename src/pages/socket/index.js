import socketIOClient from "socket.io-client";
const socket = socketIOClient("https://way2find.tk", {
  extraHeaders: {
    "Access-Control-Allow-Origin": "*",
  },
});
export default socket;
