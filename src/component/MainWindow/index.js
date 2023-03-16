import React, { useState } from "react";
import { Col, Button } from "reactstrap";

function MainWindow({ startCall, partnerId }) {
  const [disable, setDisable] = useState(true);

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    const config = { audio: true, video };

    return () => startCall(true, partnerId, config);
  };
  const numberChange = (event) => {
    if (event.target.value.length === 4) {
      setDisable(false);
    } else {
      setDisable(true);
    }

    localStorage.setItem("remote", event.target.value);
  };

  return (
    <Col xs="auto">
      <input type="number" onChange={numberChange} />
      <Button
        color="primary"
        className="py-1 px-3"
        disabled={disable}
        onClick={callWithVideo(true)}
      >
        Call
      </Button>
    </Col>
  );
}

export default MainWindow;
