import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const LandingOptions = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const isPrincipal = role === "principal";
  const roleGroup = role === "student" ? "student" : "teacher";

  const handleRouting = (route: string) => {
    navigate(route ? `/${roleGroup}/${route}` : "/");
  };

  return (
    <div className="tw:flex tw:flex-col tw:gap-4 tw:px-[10%] tw:py-28 tw:sm:px-[20%]">
      <Button
        size="lg"
        variant="secondary"
        className="tw:shadow-md"
        onClick={() => handleRouting("taskWork")}
      >
        Task Work
      </Button>
      <Button
        size="lg"
        variant="secondary"
        className="tw:shadow-md"
        onClick={() => handleRouting("syllabus")}
      >
        Syllabus
      </Button>
      <Button
        size="lg"
        variant="secondary"
        className="tw:shadow-md"
        onClick={() => handleRouting("announcement")}
      >
        Announcement
      </Button>
      {isPrincipal && (
        <Button
          size="lg"
          variant="secondary"
          className="tw:shadow-md"
          onClick={() => handleRouting("register")}
        >
          Register
        </Button>
      )}
      <Button size="lg" variant="secondary" className="tw:shadow-md" onClick={() => handleRouting("")}>
        Home
      </Button>
    </div>
  );
};

export default LandingOptions;
