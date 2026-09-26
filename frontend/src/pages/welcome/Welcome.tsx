import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/authModal/AuthModal";
import { useAuth } from "@/context/AuthContext";
import img from "../../images/pencil-bg.jfif";

type LoginRole = "teacher" | "student";

const Welcome = () => {
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState<LoginRole>("teacher");
  const { logout } = useAuth();

  // Defensive reset: arriving at Welcome (fresh visit, back-button, or
  // after sign-out) always clears any stale session.
  useEffect(() => {
    logout();
  }, [logout]);

  const handleShow = (selectedRole: LoginRole) => {
    setRole(selectedRole);
    setShowModal(true);
  };

  return (
    <>
      <div
        className="tw:flex tw:min-h-screen tw:flex-col tw:items-center tw:justify-center tw:p-4"
        style={{
          backgroundImage: `url(${img})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="tw:rounded-lg tw:bg-black/55 tw:p-8 tw:text-center tw:backdrop-blur-sm">
          <h1 className="tw:text-3xl tw:font-bold tw:text-white">Nava Dipti School</h1>
          <p className="tw:mt-2 tw:font-semibold tw:text-gray-300">Sithala, Kathpole, Sonarpur</p>
          <p className="tw:font-semibold tw:text-gray-300">Kolkata - 700150</p>
        </div>
        <div className="tw:mt-20 tw:flex tw:w-full tw:max-w-xs tw:flex-col tw:gap-3">
          <Button size="lg" variant="secondary" onClick={() => handleShow("teacher")}>
            Teacher
          </Button>
          <Button size="lg" variant="secondary" onClick={() => handleShow("student")}>
            Student
          </Button>
        </div>
      </div>
      <AuthModal role={role} show={showModal} close={() => setShowModal(false)} />
    </>
  );
};

export default Welcome;
