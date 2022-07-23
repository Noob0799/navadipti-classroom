import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import jwt_decode from "jwt-decode";

const Wrapper = ({ ChildComponent }) => {
  const [tab, setTab] = useState("Create");
  const [role, setRole] = useState("teacher");
  const navigate = useNavigate();
  useEffect(() => {
    if (!sessionStorage.getItem("token")) navigate("/");
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    setRole(role);
  }, []);

  const viewTab = () => {
    setTab("View");
  };

  return (
    <div className="wrapper-container main-wrapper">
      <div className="side-content"></div>
      <div className="main-content">
        <Navbar bg="dark" className="wrapper-navbar">
          <Container>
            <Nav>
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="back-btn"
                onClick={() => navigate(-1)}
              />
            </Nav>
            <Nav>
              {role !== "student" && (
                <>
                  <Nav.Item className="mx-2">
                    <Navbar.Text
                      className={
                        tab === "Create" ? "active-tab" : "inactive-tab"
                      }
                      onClick={() => setTab("Create")}
                    >
                      Create
                    </Navbar.Text>
                  </Nav.Item>
                  <Nav.Item className="mx-2">
                    <Navbar.Text
                      className={tab === "View" ? "active-tab" : "inactive-tab"}
                      onClick={() => setTab("View")}
                    >
                      View
                    </Navbar.Text>
                  </Nav.Item>
                </>
              )}
            </Nav>
            <Nav>
            <FontAwesomeIcon
                icon={faPowerOff}
                className="signout-btn"
                onClick={() => navigate("/")}
              />
            </Nav>
          </Container>
        </Navbar>
        <ChildComponent mode={tab} viewTab={viewTab} />
      </div>
      <div className="side-content"></div>
    </div>
  );
};

export default Wrapper;
