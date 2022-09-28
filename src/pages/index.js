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
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
  }
  componentDidMount() {
    const customerId = localStorage.getItem("me");
    socket
      .on("init", ({ id: clientId }) => {
        document.title = `${clientId} - video call`;
        this.setState({ clientId });
        console.log("clientId", clientId);
      })
      .on("request", ({ from: callFrom }) => {
        this.setState({ callModal: "active", callFrom });
      })
      .emit("init", customerId);
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
        console.log("peerStream", src);
        this.setState({ peerSrc: src });
      })

      .start(isCaller, config, this.props.customerId);
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
        {this.props.customerId !== "" && (
          <MainWindow
            clientId={clientId}
            startCall={this.startCallHandler}
            partnerId={localStorage.getItem("me")}
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
