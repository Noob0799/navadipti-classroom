import type { ComponentType } from "react";
import img from "../../images/ed-bg1.jpeg";

interface LandingProps {
  ChildComponent: ComponentType;
}

const Landing = ({ ChildComponent }: LandingProps) => {
  const backgroundStyle = {
    backgroundImage: `url(${img})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };
  return (
    <div className="wrapper-container" style={backgroundStyle}>
      <div className="side-content" />
      <div className="main-content">
        <ChildComponent />
      </div>
      <div className="side-content" />
    </div>
  );
};

export default Landing;
