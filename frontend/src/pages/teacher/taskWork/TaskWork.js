import Create from "./Create";
import View from "./View";

const TaskWork = ({ mode, viewTab }) => {
  return mode === "Create" ? <Create viewTask={viewTab}/> : <View />;
};

export default TaskWork;
