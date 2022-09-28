import React, { useEffect, useState, memo } from "react";
import { Col, Button, Row } from "reactstrap";
import classnames from "classnames";

/**
 *  CallModal
 * @param {string} status - call model open in status active
 * @param {number} callFrom -  user id
 * @param {function} startCall - call received funcation video/audio
 * @param {function} rejectCall - call not received
 */

function CallModal({ status, callFrom, startCall, rejectCall }) {
  let [second, setSecond] = useState(0);
  let [interVal, setInterVal] = useState();

  useEffect(() => {
    if (status && status === "active") {
      callTimeOut();
      setInterVal(setInterval(callTimeOut, 1000));
    } else {
      setSecond(0);
      clearInterval(interVal);
    }

    return () => {
      setSecond(0);
      clearInterval(interVal);
    };
  }, []);

  /**
   *  CallModal
   * @param {function} callTimeOut - max 60 sec call received time after call reject call.
   */
  const callTimeOut = () => {
    setSecond(second++);

    if (second === 60) {
      rejectCall();
      setSecond(0);
      clearInterval(interVal);
    }
  };

  const acceptWithVideo = (video) => {
    const config = { audio: true, video };
    return () => startCall(false, callFrom, config);
  };

  return (
    <div className={classnames("call-modal", status)}>
      <p>
        <span className="caller">{`${callFrom} is calling`}</span>
      </p>
      <Row className="align-items-center">
        <Col xs="auto">
          <Button
            color="primary"
            className="py-1 px-3"
            onClick={acceptWithVideo(true)}
          >
            Accept Call
          </Button>
        </Col>
        <Col xs="auto">
          <Button color="primary" className="py-1 px-3" onClick={rejectCall}>
            Reject Call
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default memo(CallModal);
