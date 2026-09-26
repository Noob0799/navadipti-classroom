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
import { ProtectedRoute } from "./routes/ProtectedRoute";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/landing"
          element={
            <ProtectedRoute>
              <Landing ChildComponent={LandingOptions} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/taskWork"
          element={
            <ProtectedRoute allowedRoles={["principal", "teacher"]}>
              <Wrapper ChildComponent={TeacherTaskWork} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/syllabus"
          element={
            <ProtectedRoute allowedRoles={["principal", "teacher"]}>
              <Wrapper ChildComponent={TeacherSyllabus} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/announcement"
          element={
            <ProtectedRoute allowedRoles={["principal", "teacher"]}>
              <Wrapper ChildComponent={TeacherAnnouncement} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/register"
          element={
            <ProtectedRoute allowedRoles={["principal"]}>
              <Wrapper ChildComponent={TeacherRegister} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/taskWork"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Wrapper ChildComponent={StudentTaskWork} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/syllabus"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Wrapper ChildComponent={StudentSyllabus} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/announcement"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Wrapper ChildComponent={StudentAnnouncement} />
            </ProtectedRoute>
          }
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
