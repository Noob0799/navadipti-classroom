import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useState, useRef } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const AuthModal = ({ role, show, close }) => {
  const [responseMsg, setResponseMsg] = useState("");
  const [formValidated, setFormValidated] = useState(false);
  const [isValidationComplete, setIsValidationComplete] = useState(false);
  const [userVerified, setUserVerified] = useState(false);
  const navigate = useNavigate();
  const phoneNum = useRef("");
  const password = useRef("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    let params = {};
    if (!form.checkValidity()) {
      e.stopPropagation();
    } else {
      try {
        params = {
          role,
          phoneNumber: phoneNum.current.value,
          password: password.current.value,
        };
        const response = await Axios.post(
          `/auth/validate`,
          params
        );
        const { status, message, token } = response.data;
        if (status === "Success") {
          setIsValidationComplete(true);
          setResponseMsg(message);
          setUserVerified(true);
          setTimeout(() => {
            sessionStorage.setItem("token", token);
            navigate("/landing");
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        setIsValidationComplete(true);
        if(error.code === "ERR_NETWORK") {
          setResponseMsg("Cannot connect to server. Please contact admin.");
        } else {
          setResponseMsg(error.response.data.message);
        }
        setUserVerified(false);
        setTimeout(() => {
          setIsValidationComplete(false);
          setResponseMsg("");
        }, 1000);
      }
    }

    setFormValidated(true);
  };

  return (
    <>
      <Modal show={show} onHide={close}>
        {isValidationComplete ? (
          userVerified ? (
            <>
              <FontAwesomeIcon icon={faCircleCheck} className="circle-check" />
              <div className="validation-msg">{responseMsg}</div>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faTimesCircle} className="times-circle" />
              <div className="validation-msg">{responseMsg}</div>
            </>
          )
        ) : (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Login</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={formValidated} onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3" controlId="formBasicPhoneNumber">
                  <Form.Control
                    type="text"
                    pattern="\d*"
                    placeholder="Enter phone number:"
                    ref={phoneNum}
                    onPaste={(e) => e.preventDefault()}
                    maxLength="10"
                    minLength="10"
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter your phone number.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Control
                    type="password"
                    placeholder="Enter password:"
                    ref={password}
                    onPaste={(e) => e.preventDefault()}
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter the password provided to you by the school.
                  </Form.Text>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={close}>
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Validate
                </Button>
              </Modal.Footer>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};

export default AuthModal;
