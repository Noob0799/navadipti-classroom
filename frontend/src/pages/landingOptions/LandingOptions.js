import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";

const LandingOptions = () => {
  const [role, setRole] = useState("teacher");
  const navigate = useNavigate();
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      const { role } = jwt_decode(token);
      if (!role) {
        navigate("/");
      } else {
        setRole(
          role === "teacher" || role === "principal" ? "teacher" : "student"
        );
      }
    }
  }, []);

  const handleRouting = (route) => {
    route ? navigate(`/${role}/${route}`) : navigate("/");
  };
  return (
    <div className="classroom-options-container">
      <Button
        variant="light"
        className="classroom-options"
        onClick={() => handleRouting("taskWork")}
      >
        Task Work
      </Button>
      <Button
        variant="light"
        className="classroom-options"
        onClick={() => handleRouting("syllabus")}
      >
        Syllabus
      </Button>
      <Button
        variant="light"
        className="classroom-options"
        onClick={() => handleRouting("announcement")}
      >
        Announcement
      </Button>
      <Button
        variant="light"
        className="classroom-options"
        onClick={() => handleRouting("")}
      >
        Home
      </Button>
    </div>
  );
};

export default LandingOptions;
