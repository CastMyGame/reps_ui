import "./App.css";
import MyForm from "./forms/RepsForm";
import ViolationPage from "./forms/ViolationPage";
import FailureToComplete from "./forms/FailureToComplete";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./security/Login";
import Register from "./security/Register";
import StudentDashboard from "./components/roles/student/DashboardStudent ";
import AdminDashboard from "./components/roles/admin/adminDashboard";
import PDFReport from "./roles/admin/reports/PDFReport";
import { PDFViewer } from "@react-pdf/renderer";
import TeacherDashboard from "./components/roles/teacher/teacherDashboard";
import GlobalArchivedPunishmentPanel from "./components/globalComponents/referrals/globalArchivedPunishmentPanel";
import ResetPassword from "./security/Reset";
import ForgotPassword from "./security/forgotPassword";
import { useState } from "react";
import IdleTimerContainer from "./security/IdleTimerContainer";
import SinglePageSignIn from "./security/single-page-login";
import GuidanceDashboard from "./components/roles/guidance/guidance-dashboard";

function App() {
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // const handleIdle = () => {
  //   // Perform logout logic or any other action on idle
  //   setIsLoggedOut(true);
  // };

  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            <Route path="/student-login" element={<SinglePageSignIn />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/register" element={<Register />} />
            <Route
              path="/infractionAssignments/:param1/:param2"
              element={<ViolationPage />}
            />
            <Route path="/" element={<Login />} />

            {/* Use AuthRoute for role-based access control */}
            <Route
              path="/dashboard/admin"
              element={<AdminDashboard />}
              allowedRoles={["ADMIN"]}
            />
            <Route
              path="/dashboard/student"
              element={<StudentDashboard />}
              allowedRoles={["STUDENT"]}
            />
            <Route
              path="/dashboard/guidance"
              element={<GuidanceDashboard />}
              allowedRoles={["GUIDANCE"]}
            />
            <Route
              path="/dashboard/teacher"
              element={<TeacherDashboard />}
              allowedRoles={["TEACHER"]}
            />
            <Route path="/forms/start-punishment" element={<MyForm />} />
            <Route path="/forms/ftc-closure" element={<FailureToComplete />} />
            <Route
              path="/admin/archived"
              element={<GlobalArchivedPunishmentPanel />}
            />

            <Route
              path="/forms/report"
              element={
                <>
                  <PDFViewer width="100%" height="800px">
                    <PDFReport />
                  </PDFViewer>
                </>
              }
            />

            {/* <Route path="/forms/create-assignment" element={<CreateAssignmentForm/>} /> */}
          </Routes>
          {!isLoggedOut && <IdleTimerContainer></IdleTimerContainer>}
        </div>
      </Router>
    </div>
  );
}

export default App;
