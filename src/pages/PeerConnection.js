import MediaDevice from "../component/MediaDevice";
import ScreenShare from "../component/MediaDevice/ScreenShare";
import Emitter from "./Emitter";
import socket from "./socket";
import VideoCall from "./";
import React from "react";

const PC_CONFIG = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

class PeerConnection extends Emitter {
  /**
   * Create a PeerConnection.
   * @param {String} friendID - ID of the friend you want to call.
   */

  constructor(friendID) {
    super();
    this.pc = new RTCPeerConnection(PC_CONFIG);
    this.screenShareDevice = null;

    this.senders = React.createRef(null);

    this.VideoCall = new VideoCall();
    this.pc.onicecandidate = (event) =>
      socket.emit("call", {
        to: this.friendID,
        candidate: event.candidate,
      });

    this.pc.ontrack = (event) => {
      console.log("event", event);
      if (event.streams) {
        const screenMediaStream = new MediaStream();
        screenMediaStream.addTrack(event.transceiver.receiver.track);
        this.VideoCall.state.streamRef = screenMediaStream;
        this.emit("screenShare", screenMediaStream);
      }
      this.senders.current = event.track;

      this.emit("peerStream", event.streams[0]);
    };

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
      this.mediaDevice
        .on("stream", async (stream) => {
          this.stream = stream;

          stream.getTracks().forEach((track) => {
            this.pc.addTrack(track, this.stream);
          });

          this.emit("localStream", stream);
          const friend = this.friendID;

          if (isCaller) {
            socket.emit("requestCall", {
              to: friend,
              from: localStorage.getItem("me"),
            });
          } else {
            this.createOffer();
          }
        })
        .start(config);

      return this;
    } catch (err) {
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
    this.pc
      .createOffer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  createAnswer() {
    this.pc
      .createAnswer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  getDescription(desc) {
    if (this.screenShareDevice) {
      this.pc.setRemoteDescription(desc);
    } else {
      this.pc.setLocalDescription(desc);

      socket.emit("call", { to: this.friendID, sdp: desc });
    }

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

  screenShareFunction = async () => {
    this.screenShareDeviceDevice = new ScreenShare();

    this.screenShareDeviceDevice
      .on("stream", async (stream) => {
        socket.emit("screenShare", {
          to: this.friendID,
          screenShare: "start",
        });
        // Add screen sharing transceiver to connection
        this.pc.addTransceiver(stream.getTracks()[1], {
          direction: "sendonly",
        });
        const screenTrack = stream.getTracks()[1];
        let end = () => {
          socket.emit("screenShare", {
            to: this.friendID,
            screenShare: "stop",
          });
        };

        screenTrack.onended = end;

        if (Array.isArray(this.senders.current)) {
          this.senders.current
            .find((sender) => sender.track.kind === "video")
            .replaceTrack(stream.getTracks()[1]);
        } else {
          this.senders.current = stream.getTracks()[1];
        }

        this.createOffer();
      })
      .start();
  };
}

export default PeerConnection;
