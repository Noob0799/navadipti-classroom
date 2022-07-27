import img from "../../images/ed-bg1.jpeg";

const Landing = ({ChildComponent}) => {
  const backgroundStyle = {
    backgroundImage: `url(${img})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  };
  return (
    <div className="wrapper-container" style={backgroundStyle}>
      <div className="side-content"></div>
      <div className="main-content"><ChildComponent/></div>
      <div className="side-content"></div>
    </div>
  );
};

export default Landing;