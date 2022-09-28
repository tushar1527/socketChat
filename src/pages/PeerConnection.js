import MediaDevice from "../component/MediaDevice";
import Emitter from "./Emitter";
import socket from "./socket";

const PC_CONFIG = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };

class PeerConnection extends Emitter {
  /**
   * Create a PeerConnection.
   * @param {String} friendID - ID of the friend you want to call.
   */

  constructor(friendID) {
    super();
    this.pc = new RTCPeerConnection(PC_CONFIG);
    this.pc.onicecandidate = (event) =>
      socket.emit("call", {
        to: this.friendID,
        candidate: event.candidate,
      });

    this.pc.ontrack = (event) => {
      console.log("ontrack", event);
      this.emit("peerStream", event.streams[0]);
    };
    this.pc.onaddtrack = (event) => {
      console.log("onaddtrack", event);
      this.emit("peerStream", event.streams[0]);
    };
    this.pc.addEventListener("track", (e) => {
      console.log("e", e);
    });
    // this.pc.onnegotiationneeded = () => {
    //   this.createOffer();
    // };
    this.mediaDevice = new MediaDevice();
    this.friendID = friendID;
  }

  /**
   * Starting the call
   * @param {Boolean} isCaller
   * @param {Object} config - configuration for the call {audio: boolean, video: boolean}
   */

  start(isCaller, config, callerId) {
    try {
      console.log("isCaller2", isCaller);
      this.mediaDevice
        .on("stream", (stream) => {
          console.log("stream", stream);
          stream.getTracks().forEach((track) => {
            console.log("track", track);
            this.pc.addTrack(track, stream);
          });

          console.log("this", this);
          this.emit("localStream", stream);
          const friend = this.friendID;
          console.log("this.pc", friend);
          if (isCaller) {
            console.log("isCaller", isCaller);
            socket.emit("request", { to: friend, from: callerId });
          } else {
            console.log("offer");
            this.createOffer();
          }
        })
        .start(config);
      return this;
    } catch (err) {
      console.log("err", err);
      return false;
    }
  }

  /**
   * Stop the call
   * @param {Boolean} isStarter
   */
  stop(isStarter) {
    if (isStarter) {
      socket.emit("end", { to: this.friendID });
    }
    this.mediaDevice.stop();
    this.pc.close();
    this.pc = null;
    this.off();
    return this;
  }

  createOffer() {
    console.log("createOffer");
    this.pc
      .createOffer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  createAnswer() {
    console.log("createAnswer");
    this.pc
      .createAnswer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  getDescription(desc) {
    console.log("desc", desc);
    this.pc.setLocalDescription(desc);
    socket.emit("call", { to: this.friendID, sdp: desc });
    return this;
  }

  /**
   * @param {Object} sdp - Session description
   */
  setRemoteDescription(sdp) {
    const rtcSdp = new RTCSessionDescription(sdp);
    this.pc.setRemoteDescription(rtcSdp);
    return this;
  }

  /**
   * @param {Object} candidate - ICE Candidate
   */
  addIceCandidate(candidate) {
    if (candidate) {
      const iceCandidate = new RTCIceCandidate(candidate);
      this.pc.addIceCandidate(iceCandidate);
    }
    return this;
  }
}

export default PeerConnection;
