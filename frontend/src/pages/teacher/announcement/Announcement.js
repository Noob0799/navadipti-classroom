import Create from "./Create";
import View from "./View";

const Announcement = ({ mode, viewTab }) => {
  return mode === "Create" ? <Create viewAnnouncement={viewTab} /> : <View />;
};

export default Announcement;