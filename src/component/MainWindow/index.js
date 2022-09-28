import React from "react";
import { Col, Button } from "reactstrap";

function MainWindow({ startCall, clientId, partnerId }) {
  // const [friendID, setFriendID] = useState(null);

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    const config = { audio: true, video };
    return () => partnerId && startCall(true, partnerId, config);
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
