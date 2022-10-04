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
    if (!localStorage.getItem("clientId")) {
      let setData = {
        userId: localStorage.getItem("userId"),
        roomId: localStorage.getItem("roomId"),
      };
      socket
        .on("init", ({ response, id }) => {
          this.setState({ clientId: id });
          console.log("id", id);
          localStorage.setItem("me", id);

          document.title = `${id} - video call`;

          if (response.drSocketId && response.patientSocketId) {
            let partnerId;

            if (this.state.clientId === response.drSocketId) {
              this.setState({ partnerId: response.patientSocketId });
            } else {
              this.setState({ partnerId: response.drSocketId });
            }
          }
        })
        .on("requestCall", ({ from: callFrom }) => {
          console.log("callFrom", callFrom);
          this.setState({ callModal: "active", callFrom });
        })
        .on("update", (data) => {
          console.log("callFrom", data);
        })
        .on("call", (data) => {
          console.log("data", data);
          if (data.sdp) {
            this.pc.setRemoteDescription(data.sdp);
            if (data.sdp.type === "offer") this.pc.createAnswer();
          } else this.pc.addIceCandidate(data.candidate);
        })
        .on("end", this.endCall.bind(this, false))
        .emit("init", setData);
    }
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
