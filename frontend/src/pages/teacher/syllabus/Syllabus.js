import Create from "./Create";
import View from "./View";

const Syllabus = ({ mode, viewTab }) => {
  return mode === "Create" ? <Create viewSyllabus={viewTab}/> : <View />;
};

export default Syllabus;