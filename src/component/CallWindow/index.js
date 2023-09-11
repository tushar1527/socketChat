import React, { useState, useEffect, useRef } from "react";
import { Col, Button, Row } from "reactstrap";

import classnames from "classnames";

const getButtonClass = (enabled) =>
  classnames(`py-1 px-3`, { disable: !enabled });

function CallWindow({
  peerSrc,
  localSrc,
  config,
  mediaDevice,
  status,
  endCall,
  screenShareHandler,
  streamRef,
  screenShare,
  restartCall,
}) {
  const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const screenVideo = useRef(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);

  useEffect(() => {
    if (peerVideo.current && peerSrc) {
      peerVideo.current.srcObject = peerSrc;
    }
    if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
    if (screenVideo.current && streamRef) {
      screenVideo.current.srcObject = streamRef;
    }
  });

  useEffect(() => {
    if (mediaDevice) {
      mediaDevice.toggle("Video", video);
      mediaDevice.toggle("Audio", audio);
    }
  });

  /**
   * Turn on/off a media device
   * @param {String} deviceType - Type of the device eg: Video, Audio
   */
  const toggleMediaDevice = (deviceType) => {
    if (deviceType === "video") {
      setVideo(!video);
      mediaDevice.toggle("Video");
    }
    if (deviceType === "audio") {
      setAudio(!audio);
      mediaDevice.toggle("Audio");
    }
  };

  return (
    <div
      className={classnames("call-window", status)}
      style={{ backgroundColor: "black" }}
    >
      <div id="mediaWrapper"></div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ float: "left", width: "50%" }}>
          <video
            id="localVideo"
            ref={localVideo}
            autoPlay
            muted
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ float: "right", width: "50%" }}>
          <video
            id="peerVideo"
            ref={peerVideo}
            autoPlay
            style={{ width: "100%" }}
          />
        </div>
        {screenVideo && screenShare ? (
          <div style={{ float: "left", width: "50%" }}>
            <video
              id="screenShare"
              ref={screenVideo}
              autoPlay
              style={{ width: "100%" }}
            />
          </div>
        ) : (
          ""
        )}
      </div>

      <div className="video-control">
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              color="primary"
              className={getButtonClass(video)}
              onClick={() => toggleMediaDevice("video")}
            >
              Video Call
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              color="primary"
              className={getButtonClass(audio)}
              onClick={() => toggleMediaDevice("audio")}
            >
              Voice Call
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              color="primary"
              className="py-1 px-3"
              onClick={() => endCall(true)}
            >
              End Call
            </Button>
          </Col>

          <Col xs="auto">
            <Button
              color="primary"
              className="py-1 px-3"
              onClick={() => screenShareHandler(true)}
            >
              Screen Share
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CallWindow;
