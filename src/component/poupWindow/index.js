import React from "react";
import { makeStyles } from "@mui/styles";
import { Dialog } from "@mui/material";
import CallWindow from "../CallWindow";

function FullScreenDialog(props) {
  const {
    config,
    pc,
    endCallHandler,
    screenShareHandler,

    state: {
      callWindow,
      localSrc,
      peerSrc,
      videoModel,
      streamRef,
      screenShare,
    },
  } = props;
  //  const {videoModel}=props

  return (
    <div className="vishal">
      <Dialog
        style={{ backgroundColor: "black" }}
        fullScreen
        open={videoModel}
        onClose={() => {}}
      >
        <CallWindow
          status={callWindow}
          localSrc={localSrc}
          peerSrc={peerSrc}
          config={config}
          mediaDevice={pc.mediaDevice}
          endCall={endCallHandler}
          screenShareHandler={screenShareHandler}
          streamRef={streamRef}
          screenShare={screenShare}
        />
      </Dialog>
    </div>
  );
}

export default FullScreenDialog;
