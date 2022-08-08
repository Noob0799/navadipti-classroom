import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Axios from "axios";
import jwt_decode from "jwt-decode";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Create = ({ viewUsers }) => {
  const [validated, setValidated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [identity, setIdentity] = useState("teacher");
  const navigate = useNavigate();
  const name = useRef("");
  const studentClass = useRef("Nursery");
  const roll = useRef(1);
  const phoneNumber = useRef("");
  const password = useRef("");

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === "teacher" && role === "principal";
    });
    if (index < 0) {
      navigate("/");
    }
  }, []);

  const handleIdentityChange = (e) => {
    setIdentity(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      params = {};
    let url = "",
      response;
    if (!form.checkValidity()) {
      e.stopPropagation();
    } else {
      setIsRegistering(true);
      params.identity = identity;
      params.name = name.current.value;
      if (identity === "student") {
        params.studentClass = studentClass.current.value;
        params.roll = roll.current.value;
      }
      params.phoneNumber = phoneNumber.current.value;
      params.password = password.current.value;
      try {
        response = await Axios.post(`/auth/register`, params, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (response.data.status === "Success") {
          console.log("User created successfully!!");
          toast.success("User created successfully!!");
          setTimeout(() => {
            setIsRegistering(false);
            viewUsers();
          }, 2000);
        }
      } catch (error) {
        setIsRegistering(false);
        console.log("User creation failed!!", error);
        toast.error(error && error.response && error.response.status === 409 ? error.response.data.message : "User creation failed!!");
        if (error.response.data.type === "TokenExpiredError") {
          toast.error("Session timeout. Please login again!!");
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
      }
    }
    setValidated(true);
  };

  return (
    <>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className="form-container"
      >
        <Form.Group className="mb-3" controlId="formBasicName">
          <Form.Label>* Name:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            ref={name}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="validationCustomIdentity">
          <Form.Label className="form-label">* Identity:</Form.Label>
          <Form.Select
            aria-label="Identity"
            onChange={handleIdentityChange}
            required
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </Form.Select>
        </Form.Group>
        {identity === "student" && (
          <>
            <Form.Group className="mb-3" controlId="validationCustomClass">
              <Form.Label className="form-label">* Class:</Form.Label>
              <Form.Select aria-label="Class" ref={studentClass} required>
                <option value="Nursery">Nursery</option>
                <option value="KG">KG</option>
                <option value="Transition">Transition</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicRoll">
              <Form.Label>* Roll Number:</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter roll number"
                min="1"
                max="100"
                ref={roll}
                required
              />
              <Form.Control.Feedback type="invalid">
                Roll number has to be within 1 and 100
              </Form.Control.Feedback>
            </Form.Group>
          </>
        )}
        <Form.Group className="mb-3" controlId="formBasicPhone">
          <Form.Label>* Phone Number:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter phone number"
            autoComplete="off"
            ref={phoneNumber}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassworde">
          <Form.Label>* Password:</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            autoComplete="off"
            ref={password}
            required
          />
        </Form.Group>
        <div className="form-btn-container">
          <Button type="submit" variant="success" className="form-btn-container-btn" disabled={isRegistering}>
            {isRegistering ? (
              <>
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              </>
            ) : (
              "Register"
            )}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default Create;
