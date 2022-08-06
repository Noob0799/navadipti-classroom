import Create from "./Create";
import View from "./View";

const Register = ({ mode, viewTab }) => {
  return mode === "Create" ? <Create viewUsers={viewTab} /> : <View />;
};

export default Register;