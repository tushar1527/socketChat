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
  }
  componentDidMount() {
    socket
      .on("init", ({ id: clientId }) => {
        document.title = `${clientId} - video call`;
        this.setState({ clientId });
        localStorage.setItem("me", clientId);
      })
      .on("requestCall", ({ from: callFrom }) => {
        localStorage.setItem("remote", callFrom);
        this.setState({ callModal: "active", callFrom });
      })
      .on("screenShare", (data) => {
        console.log("data", data.screenShare);
        if (data.screenShare === "start") {
          this.setState({ screenShare: true });
        }
        if (data.screenShare === "stop") {
          this.setState({ screenShare: false, streamRef: null });
        }
      })
      .on("call", (data) => {
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
        console.log("localStream", src);
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
