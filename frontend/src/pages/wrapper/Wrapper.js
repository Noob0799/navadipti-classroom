import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const Wrapper = ({ ChildComponent }) => {
  const [tab, setTab] = useState("Create");
  const navigate = useNavigate();
  useEffect(() => {
    if (!sessionStorage.getItem("token")) navigate("/");
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
            <Nav><FontAwesomeIcon icon={faArrowLeft} className="back-btn" onClick={() => navigate(-1)}/></Nav>
            <Nav>
              <Nav.Item className="mx-2">
                <Navbar.Text
                  className={tab === "Create" ? "active-tab" : "inactive-tab"}
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
            </Nav>
            <Nav></Nav>
          </Container>
        </Navbar>
        <ChildComponent mode={tab} viewTab={viewTab} />
      </div>
      <div className="side-content"></div>
    </div>
  );
};

export default Wrapper;
