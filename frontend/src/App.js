import { Route, Routes } from "react-router-dom";
import Welcome from "./pages/welcome/Welcome";
import Wrapper from "./pages/wrapper/Wrapper";
import Landing from "./pages/landing/Landing";
import LandingOptions from "./pages/landingOptions/LandingOptions";
import TeacherTaskWork from "./pages/teacher/taskWork/TaskWork";
import TeacherSyllabus from "./pages/teacher/syllabus/Syllabus";
import TeacherAnnouncement from "./pages/teacher/announcement/Announcement";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome/>}/>
        <Route path="/landing" element={<Landing ChildComponent={LandingOptions}/>}/>
        <Route path="/teacher/taskWork" element={<Wrapper ChildComponent={TeacherTaskWork}/>}/>
        <Route path="/teacher/syllabus" element={<Wrapper ChildComponent={TeacherSyllabus}/>}/>
        <Route path="/teacher/announcement" element={<Wrapper ChildComponent={TeacherAnnouncement}/>}/>
      </Routes>
    </>
  );
};

export default App;
