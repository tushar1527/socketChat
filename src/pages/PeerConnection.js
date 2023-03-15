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

    this.screen = null;
    this.screenStream = null;
    this.stream = null;
    this.localScreenStream = null;
    this.cam = null;
    this.audioContext = null;
    this.audioDestination = null;
    this.mediaRecorder = null;
    this.localCamStream = null;
    this.localOverlayStream = null;
    this.rafId = null;
    this.audioTracks = [];
    this.recordedChunks = [];
    this.mediaRecorder = null;
    this.fullStream = null;
    this.fullStreamPeer = null;
    this.currentPeer = null;
    this.canvasElement = document.createElement("canvas");
    this.canvasCtx = this.canvasElement.getContext("2d");
    this.senders = React.createRef(null);

    this.encoderOptions = { mimeType: "video/webm; codecs=vp9" };

    this.pc.onicecandidate = (event) =>
      socket.emit("call", {
        to: this.friendID,
        candidate: event.candidate,
      });

    this.pc.ontrack = (event) => {
      this.senders.current = event.track;
      this.emit("peerStream", event.streams[0]);
    };

    this.mediaDevice = new MediaDevice();

    this.friendID = friendID;
    this.VideoCall = new VideoCall();
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

          this.currentPeer = this.pc;
          this.cam = await this.attachToDOM("justWebcam", stream);
          this.fullStream.getTracks().forEach((track) => {
            this.pc.addTrack(track, this.stream);
          });

          this.emit("localStream", this.fullStream);
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
    console.log("createOffer");
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

  requestVideoFrame = (callback) => {
    return window.setTimeout(function () {
      callback(Date.now());
    }, 1000 / 60); // 60 fps - just like requestAnimationFrame
  };

  makeComposite = async () => {
    if (this.cam && this.screen) {
      this.canvasCtx.save();
      this.canvasElement.setAttribute("width", `${this.screen.width}px`);
      this.canvasElement.setAttribute("height", `${this.screen.height}px`);
      this.canvasCtx.clearRect(0, 0, this.screen.width, this.screen.height);
      this.canvasCtx.drawImage(
        this.screen,
        0,
        0,
        this.screen.width,
        this.screen.height
      );
      this.canvasCtx.drawImage(
        this.cam,
        0,
        Math.floor(this.screen.height - this.screen.height / 4),
        Math.floor(this.screen.width / 4),
        Math.floor(this.screen.height / 4)
      ); // this is just a rough calculation to offset the webcam stream to bottom left
      let imageData = this.canvasCtx.getImageData(
        0,
        0,
        this.screen.width,
        this.screen.height
      ); // this makes it work
      this.canvasCtx.putImageData(imageData, 0, 0); // properly on safari/webkit browsers too
      this.canvasCtx.restore();
      this.rafId = this.requestVideoFrame(this.makeComposite);
    }
  };
  handleDataAvailable(event) {
    if (event.data.size > 0) {
      this.recordedChunks.push(event.data);

      this.download();
    }
  }
  download() {
    var blob = new Blob(this.recordedChunks, {
      type: "video/webm",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "result.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async mergeStreamsFn() {
    await this.makeComposite();
    this.audioContext = new AudioContext();
    this.audioDestination = this.audioContext.createMediaStreamDestination();
    let fullVideoStream = this.canvasElement.captureStream();

    console.log("this", this);
    let existingAudioStreams = [
      ...(this.fullVideoStream ? this.fullVideoStream.getAudioTracks() : []),
      ...(this.screen ? this.screenStream.getAudioTracks() : []),
    ];

    existingAudioStreams.length !== 0 &&
      this.audioTracks.push(
        this.audioContext.createMediaStreamSource(
          new MediaStream([existingAudioStreams[0]])
        )
      );
    if (existingAudioStreams.length > 1) {
      this.audioTracks.push(
        this.audioContext.createMediaStreamSource(
          new MediaStream([existingAudioStreams[1]])
        )
      );
    }
    this.audioTracks.map((track) => track.connect(this.audioDestination));

    this.localOverlayStream = new MediaStream([
      ...fullVideoStream.getVideoTracks(),
    ]);
    let fullOverlayStream = new MediaStream([
      ...fullVideoStream.getVideoTracks(),
      ...this.audioDestination.stream.getTracks(),
    ]);

    if (this.localOverlayStream) {
      console.log("this.localOverlayStream", this.localOverlayStream);
      let overlay = await this.attachToDOM(
        "pipOverlayStream",
        this.localOverlayStream
      );
      // this.emit("localStream", this.localOverlayStream);
      this.mediaRecorder = new MediaRecorder(
        fullOverlayStream,
        this.encoderOptions
      );
      this.mediaRecorder.ondataavailable = this.handleDataAvailable;
      overlay.volume = 0;
      // this.cam.volume = 0;
      // this.screen.volume = 0;
      // this.cam.style.display = "none";
      // localCamStream.getAudioTracks().map(track => { track.enabled = false });
      // this.screen.style.display = "none";
      // localScreenStream.getAudioTracks().map(track => { track.enabled = false });
    }
  }

  attachToDOM = async (id, stream) => {
    let mediaWrapperDiv = document.getElementById("mediaWrapper");

    let videoElem = document.createElement("video");
    videoElem.id = id;

    if (id == "justWebcam") {
      videoElem.width = 100;
      videoElem.height = 360;
      videoElem.autoplay = true;
      videoElem.setAttribute("playsinline", true);
      videoElem.srcObject = new MediaStream(stream.getTracks());
      mediaWrapperDiv.appendChild(videoElem);

      this.fullStream = stream;
    } else {
      videoElem.width = 800;
      videoElem.height = 800;
      videoElem.autoplay = true;
      videoElem.setAttribute("playsinline", true);
      videoElem.srcObject = new MediaStream(stream.getTracks());
      mediaWrapperDiv.appendChild(videoElem);
      this.screenStream = stream;
    }
    return videoElem;
  };

  screenShareFunction = async () => {
    this.screenShareDeviceDevice = new ScreenShare();

    this.screenShareDeviceDevice
      .on("stream", async (stream) => {
        // const combinedMediaStream = new MediaStream([
        //   ...this.stream.getTracks(),
        //   ...stream.getTracks(),
        // ]);

        this.screen = await this.attachToDOM("justScreenShare", stream);
        let vCallObj = new VideoCall();
        vCallObj.state.streamRef = stream;
        const screenTrack = stream.getTracks()[1];
        await this.mergeStreamsFn(this.cam);
        // this.emit("localStream", combinedMediaStream);
        let screenUpdate = this.localOverlayStream.getTracks();
        console.log("screenUpdate", screenUpdate);
        stream.getTracks().forEach((track) => {
          if (track.kind === "video") this.pc.addTrack(track, stream);
        });

        if (Array.isArray(this.senders.current)) {
          this.senders.current
            .find((sender) => sender.track.kind === "video")
            .replaceTrack(screenTrack);
        } else {
          this.senders.current = screenTrack;
        }
        let end = () => {
          this.emit("localStream", this.stream);
        };

        screenTrack.onended = end;

        this.createOffer();
      })
      .start();
  };
}

export default PeerConnection;
