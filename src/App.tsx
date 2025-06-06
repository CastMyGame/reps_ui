import "./App.css";
import ViolationPage from "./forms/ViolationPage";
import FailureToComplete from "./forms/FailureToComplete";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./security/Register";
import StudentDashboard from "./components/roles/student/DashboardStudent ";
import AdminDashboard from "./components/roles/admin/adminDashboard";
import PDFReport from "./components/roles/admin/reports/PDFReport";
import { PDFViewer } from "@react-pdf/renderer";
import TeacherDashboard from "./components/roles/teacher/teacherDashboard";
import GlobalArchivedPunishmentPanel from "./components/globalComponents/referrals/globalArchivedPunishmentPanel";
import ResetPassword from "./security/Reset";
import ForgotPassword from "./security/forgotPassword";
import { useState } from "react";
import IdleTimerContainer from "./security/IdleTimerContainer";
import SinglePageSignIn from "./security/single-page-login";
import GuidanceDashboard from "./components/roles/guidance/guidance-dashboard";
import LandingPage from "./components/globalComponents/updatedLanding/landing";
import AuthRoute from "./utils/api/api";

function App() {
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            <Route path="/student-login" element={<SinglePageSignIn />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/register" element={<Register />} />
            <Route
              path="/infractionAssignments/:param1/:param2"
              element={<ViolationPage />}
            />
            <Route path="/" element={<LandingPage />} />

            {/* Use AuthRoute for role-based access control */}
            <Route
              path="/dashboard/admin"
              element={
                <AuthRoute allowedRoles={["ADMIN"]} userRole={"ADMIN"}>
                  <AdminDashboard />
                </AuthRoute>
              }
            />
            <Route
              path="/dashboard/student"
              element={
                <AuthRoute allowedRoles={["STUDENT"]} userRole={"STUDENT"}>
                  <StudentDashboard />
                </AuthRoute>
              }
            />
            <Route
              path="/dashboard/guidance"
              element={
                <AuthRoute allowedRoles={["GUIDANCE"]} userRole={"GUIDANCE"}>
                  <GuidanceDashboard />
                </AuthRoute>
              }
            />
            <Route
              path="/dashboard/teacher"
              element={<AuthRoute allowedRoles={["TEACHER"]} userRole={"TEACHER"}><TeacherDashboard /></AuthRoute>}
            />
            <Route path="/forms/ftc-closure" element={<FailureToComplete />} />
            <Route
              path="/admin/archived"
              element={<GlobalArchivedPunishmentPanel filter="PENDING" roleType="admin"/>}
            />

            <Route
              path="/forms/report"
              element={
                <PDFViewer width="100%" height="800px">
                  <PDFReport />
                </PDFViewer>
              }
            />
          </Routes>
          {!isLoggedOut && <IdleTimerContainer></IdleTimerContainer>}
        </div>
      </Router>
    </div>
  );
}

export default App;
