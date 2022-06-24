import AuthModal from "../../components/authModal/AuthModal";
import { useEffect, useState } from 'react';

const Welcome = () => {
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("teacher");
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleShow = (role) => {
    setRole(role);
    setShowModal(true);
  };
  const handleClose = () => setShowModal(false);

  return (
    <>
      <div className="welcome-container">
        <section className="school-details">
          <h1>Nava Dipti School</h1>
          <h4>Sithala, Kathpole, Sonarpur</h4>
          <h4>Kolkata - 700150</h4>
        </section>
        <div className="d-grid gap-2 col-6 mx-auto welcome-btn-container">
          <button className="btn btn-light" type="button" onClick={() => handleShow("teacher")}>
            Teacher
          </button>
          <button className="btn btn-light" type="button" onClick={() => handleShow("student")}>
            Student
          </button>
        </div>
      </div>
      <AuthModal role={role} show={showModal} close={handleClose}/>
    </>
  );
};

export default Welcome;
