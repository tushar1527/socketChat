import React, { Component } from "react";
import MainWindow from "../component/MainWindow";
import socket from "../pages/socket";
import _ from "lodash";
import PeerConnection from "../pages/PeerConnection";
import FullScreenDialog from "../component/poupWindow";
import CallModal from "../component/CallModal";

class VideoCall extends Component {
  constructor() {
    super();
    this.state = {
      clientId: "",
      callWindow: "",
      callModal: "",
      callFrom: "",
      videoModel: true,
      localSrc: null,
      peerSrc: null,
      partnerId: localStorage.getItem("remote"),
      streamRef: null,
      peer: null,
      screenShareRef: React.createRef(null),
      currentPeer: null,
      screenShare: false,
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
    this.screenShareHandler = this.screenShare.bind(this);
    this.restartHandler = this.restart.bind(this);
  }
  componentDidMount() {
    socket
      // // .on("init", ({ id: clientId }) => {
      // //   console.log("clientId", clientId);
      // //   document.title = `${clientId} - video call`;
      // //   this.setState({ clientId });
      // //   localStorage.setItem("me", clientId);
      // // })
      // .on("requestCall", ({ from: callFrom }) => {
      //   localStorage.setItem("remote", callFrom);
      //   this.setState({ callModal: "active", callFrom });
      // })
      // .on("screenShare", (data) => {
      //   console.log("data", data.screenShare);
      //   if (data.screenShare === "start") {
      //     this.setState({ screenShare: true });
      //   }
      //   if (data.screenShare === "stop") {
      //     this.setState({ screenShare: false, streamRef: null });
      //   }
      // })
      // .on("call", (data) => {
      //   console.log("data", data);
      //   if (data.sdp) {
      //     this.pc.setRemoteDescription(data.sdp);
      //     if (data.sdp.type === "offer") this.pc.createAnswer();
      //   } else this.pc.addIceCandidate(data.candidate);
      // })
      // .on("end", this.endCall.bind(this, false))
      // .on("reTransform", (data) => {
      //   console.log("data", data);
      //   // localStorage.setItem("remote", data.from);
      //   // const config = { audio: true, video: true };
      //   // let friendID = data.from;
      //   // this.startCallHandler(false, friendID, config);
      // })
      .on(localStorage.getItem("room"), (data) => {
        if (data.channel === "init") {
          localStorage.setItem("remote", data.room.from);
        } else if (data.channel === "callFrom") {
          localStorage.setItem("remote", data.room.from);
          let from = data.room.from;
          this.setState({ callModal: "active", from });
        } else if (data.channel === "startCall") {
          console.log("data", data);
          if (data.room.sdp) {
            this.pc.setRemoteDescription(data.room.sdp);
            if (data.room.sdp.type === "offer") this.pc.createAnswer();
          } else this.pc.addIceCandidate(data.room.candidate);
        }
      })
      .emit("init", {
        room: localStorage.getItem("room"),
        userId: localStorage.getItem("me"),
      });
  }

  startCall(isCaller, friendID, config) {
    this.config = config;
    this.pc = new PeerConnection(localStorage.getItem("room"))
      .on("localStream", (src) => {
        const newState = {
          callWindow: "active",
          localSrc: src,
          videoModel: true,
        };

        if (!isCaller) newState.callModal = "";

        this.setState(newState);
      })
      .on("screenShare", (src) => {
        this.setState({ streamRef: src });
      })
      .on("peerStream", (src) => {
        this.setState({ peerSrc: src });
      });
    console.log("aaaa", this.pc);
    this.setState({ peer: this.pc, currentPeer: this.pc });
    this.pc.start(isCaller, config, friendID);
  }
  rejectCall() {
    const { callFrom } = this.state;
    socket.emit("end", { to: callFrom });
    this.setState({ callModal: "" });
  }

  endCall = async (isStarter) => {
    if (_.isFunction(this.pc.stop)) {
      this.pc.stop(isStarter);
    }

    this.pc = {};
    this.config = null;
    this.setState({
      callWindow: "",
      callModal: "",
      localSrc: null,
      peerSrc: null,
    });
  };

  screenShare = async (data) => {
    this.pc.screenShareFunction();
  };
  restart = async (data) => {
    console.log("restart", data);
    // let updatePayload = {
    //   me: localStorage.getItem("me"),
    //   to: localStorage.getItem("remote"),
    // };
    // console.log("updatePayload", updatePayload);
    // socket.emit("reTransform", updatePayload);
    // this.startCallHandler();
    const config = { audio: true, video: true };
    let friendID = localStorage.getItem("room");

    this.startCallHandler(true, friendID, config);
  };

  render() {
    const { clientId, callFrom, callModal } = this.state;
    return (
      <div>
        {localStorage.getItem("me") && (
          <MainWindow
            clientId={localStorage.getItem("me")}
            startCall={this.startCallHandler}
            partnerId={this.state.partnerId}
            restartCall={this.restartHandler}
          />
        )}
        {!_.isEmpty(this.config) && <FullScreenDialog {...this} />}
        {callModal === "active" && (
          <CallModal
            status={callModal}
            startCall={this.startCallHandler}
            rejectCall={this.rejectCallHandler}
            callFrom={callFrom}
          />
        )}
      </div>
    );
  }
}
export default VideoCall;
