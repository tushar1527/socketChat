import React from "react";
import { Col, Button } from "reactstrap";

function MainWindow({ startCall, partnerId }) {
  console.log("partnerId", partnerId);
  // const [friendID, setFriendID] = useState(null);

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    console.log("video", video);
    const config = { audio: true, video };
    console.log("partnerId", partnerId);
    return () => startCall(true, partnerId, config);
  };

  return (
    <Col xs="auto">
      <Button
        color="primary"
        className="py-1 px-3"
        onClick={callWithVideo(true)}
      >
        Call
      </Button>
    </Col>
  );
}

export default MainWindow;
