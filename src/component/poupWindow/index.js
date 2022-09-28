import React from "react";
import { makeStyles } from "@mui/styles";
import { Dialog } from "@mui/material";
import CallWindow from "../CallWindow";

function FullScreenDialog(props) {
  const {
    config,
    pc,
    endCallHandler,
    state: { callWindow, localSrc, peerSrc, videoModel },
  } = props;
  //  const {videoModel}=props

  return (
    <div className="vishal">
      <Dialog
        style={{ backgroundColor: "balck" }}
        fullScreen
        open={videoModel}
        onClose={() => {}}
      >
        {/* <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Sound
            </Typography>
            <Button autoFocus color="inherit" onClick={()=>{}}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          <ListItem button>
            <ListItemText primary="Phone ringtone" secondary="Titania" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Default notification ringtone" secondary="Tethys" />
          </ListItem>
        </List> */}
        <CallWindow
          status={callWindow}
          localSrc={localSrc}
          peerSrc={peerSrc}
          config={config}
          mediaDevice={pc.mediaDevice}
          endCall={endCallHandler}
        />
      </Dialog>
    </div>
  );
}

export default FullScreenDialog;
