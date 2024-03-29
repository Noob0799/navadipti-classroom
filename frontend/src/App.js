import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Welcome from "./pages/welcome/Welcome";
import Wrapper from "./pages/wrapper/Wrapper";
import Landing from "./pages/landing/Landing";
import LandingOptions from "./pages/landingOptions/LandingOptions";
import TeacherTaskWork from "./pages/teacher/taskWork/TaskWork";
import TeacherSyllabus from "./pages/teacher/syllabus/Syllabus";
import TeacherAnnouncement from "./pages/teacher/announcement/Announcement";
import TeacherRegister from "./pages/teacher/register/Register";
import StudentTaskWork from "./pages/student/taskWork/TaskWork";
import StudentSyllabus from "./pages/student/syllabus/Syllabus";
import StudentAnnouncement from "./pages/student/announcement/Announcement";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/landing"
          element={<Landing ChildComponent={LandingOptions} />}
        />
        <Route
          path="/teacher/taskWork"
          element={<Wrapper ChildComponent={TeacherTaskWork} />}
        />
        <Route
          path="/teacher/syllabus"
          element={<Wrapper ChildComponent={TeacherSyllabus} />}
        />
        <Route
          path="/teacher/announcement"
          element={<Wrapper ChildComponent={TeacherAnnouncement} />}
        />
        <Route
          path="/teacher/register"
          element={<Wrapper ChildComponent={TeacherRegister} />}
        />
        <Route
          path="/student/taskWork"
          element={<Wrapper ChildComponent={StudentTaskWork} />}
        />
        <Route
          path="/student/syllabus"
          element={<Wrapper ChildComponent={StudentSyllabus} />}
        />
        <Route
          path="/student/announcement"
          element={<Wrapper ChildComponent={StudentAnnouncement} />}
        />
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
