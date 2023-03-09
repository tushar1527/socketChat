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
      partnerId: "",
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
  }
  componentDidMount() {
    console.log("aaa");
    socket
      .on("init", ({ id: clientId }) => {
        console.log("clientId", clientId);
        document.title = `${clientId} - video call`;
        this.setState({ clientId });
        localStorage.setItem("me", clientId);
      })
      .on("request", ({ from: callFrom }) => {
        console.log("callFrom", callFrom);
        this.setState({ callModal: "active", callFrom });
      })
      .on("call", (data) => {
        console.log("data", data);
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === "offer") this.pc.createAnswer();
        } else this.pc.addIceCandidate(data.candidate);
      })
      .on("end", this.endCall.bind(this, false))
      .emit("init", { customerId: "aaa" });
  }
  startCall(isCaller, friendID, config) {
    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on("localStream", (src) => {
        const newState = {
          callWindow: "active",
          localSrc: src,
          videoModel: true,
        };
        if (!isCaller) newState.callModal = "";
        this.setState(newState);
      })
      .on("peerStream", (src) => {
        console.log("peerStream start cll");
        this.setState({ peerSrc: src });
      })
      .start(isCaller, config, friendID);
  }
  rejectCall() {
    const { callFrom } = this.state;
    // socket.emit("end", { to: callFrom });
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
  render() {
    const { clientId, callFrom, callModal } = this.state;
    return (
      <div>
        {clientId && (
          <MainWindow
            clientId={clientId}
            startCall={this.startCallHandler}
            partnerId={this.state.partnerId}
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
