import { useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import img from "../../images/classroom-bg1.jpg";

type Mode = "Create" | "View";

interface WrapperProps {
  ChildComponent: ComponentType<{ mode: Mode; viewTab: () => void }>;
}

const Wrapper = ({ ChildComponent }: WrapperProps) => {
  const [tab, setTab] = useState<Mode>("Create");
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const viewTab = () => setTab("View");

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const backgroundStyle = {
    backgroundImage: `url(${img})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  return (
    <div className="wrapper-container main-wrapper" style={backgroundStyle}>
      <div className="side-content" />
      <div className="main-content">
        <div className="tw:flex tw:h-[50px] tw:items-center tw:justify-between tw:bg-black/70 tw:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="tw:text-gray-200 tw:hover:bg-white/10 tw:hover:text-white"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft className="tw:size-5" />
          </Button>
          {role !== "student" && (
            <div className="tw:flex tw:rounded-full tw:border tw:border-white/20 tw:bg-white/5 tw:p-0.5">
              {(["Create", "View"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTab(option)}
                  className={cn(
                    "tw:rounded-full tw:px-4 tw:py-1 tw:text-sm tw:font-medium tw:transition-colors",
                    tab === option
                      ? "tw:bg-white tw:text-black"
                      : "tw:text-gray-300 tw:hover:text-white"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="tw:text-gray-200 tw:hover:bg-white/10 tw:hover:text-white"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <Power className="tw:size-5" />
          </Button>
        </div>
        <ChildComponent mode={tab} viewTab={viewTab} />
      </div>
      <div className="side-content" />
    </div>
  );
};

export default Wrapper;
