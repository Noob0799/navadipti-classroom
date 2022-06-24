

const Landing = ({ChildComponent}) => {
  return (
    <div className="wrapper-container main-landing">
      <div className="side-content"></div>
      <div className="main-content"><ChildComponent/></div>
      <div className="side-content"></div>
    </div>
  );
};

export default Landing;