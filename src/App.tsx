import "./App.css";
import { NotificationProvider } from "./notifications/NotificationProvider";
import NotificationHost from "./notifications/NotificationHost";
import MobileAdminCreateRecord from "./components/mobile/admin/MobileAdminCreateRecord";
import MobileAdminHome from "./components/mobile/admin/MobileAdminHome";
import ViolationPage from "./forms/ViolationPage";
import FailureToComplete from "./forms/FailureToComplete";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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
import PrivatePolicyPage from "./components/globalComponents/updatedLanding/privacy-policy";
import CheckoutCancel from "./security/checkoutCancel";
import CheckoutSuccess from "./security/checkoutSuccess";
import MobileAdminOpenWriteUps from "./components/mobile/admin/MobileAdminOpenWriteUps";
import DevSessionLogin from "./security/DevSessionLogin";
import MobileLandingLogin from "./components/mobile/MobileLandingLogin";
import MobileAdminHomeV2 from "./components/mobile/admin/MobileAdminHomeV2";
import MobileAdminCreateRecordV2 from "./components/mobile/admin/MobileAdminCreateRecordV2";
import MobileAdminPositiveBehavior from "./components/mobile/admin/MobileAdminPositiveBehavior";
 import MobileAdminCreateStudentTeacherV2 from "./components/mobile/admin/MobileAdminCreateStudentTeacherV2";


function App() {
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  return (
    <div className="App">
      <Router>
        <NotificationProvider>
          <div>
            <NotificationHost />
            <Routes>
              <Route path="/sign-up" element={<Register />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route path="/privacy-policy" element={<PrivatePolicyPage />} />
              <Route path="/student-login" element={<SinglePageSignIn />} />
              <Route path="/dev/session" element={<DevSessionLogin />} />
              <Route path="/login" element={<LandingPage />} />
              <Route path="/m/landing-login" element={<MobileLandingLogin />} />
              <Route
                path="/m/admin"
                element={
                  <AuthRoute allowedRoles={["ADMIN"]} userRole={"ADMIN"}>
                    <MobileAdminHomeV2 />
                  </AuthRoute>
                }
              />
              <Route
                path="/m/admin/admin-create"
                element={
                  <AuthRoute allowedRoles={["ADMIN"]} userRole={"ADMIN"}>
                    <MobileAdminCreateRecord />
                  </AuthRoute>
                }
              />
              <Route
                path="/m/admin/admin-create-v2"
                element={
                  <AuthRoute allowedRoles={["ADMIN"]} userRole={"ADMIN"}>
                    <MobileAdminCreateRecordV2 />
                  </AuthRoute>
                }
              />

               <Route
    path="/m/admin/create-person"
    element={
      <AuthRoute allowedRoles={["ADMIN"]} userRole={"ADMIN"}>
        <MobileAdminCreateStudentTeacherV2 />
      </AuthRoute>
    }
  />

              <Route
                path="/m/admin/write-ups"
                element={
                  <AuthRoute allowedRoles={["ADMIN"]} userRole={"ADMIN"}>
                    <MobileAdminOpenWriteUps />
                  </AuthRoute>
                }
              />

              <Route
                path="/m/admin/positive-behavior"
                element={
                  <AuthRoute allowedRoles={["ADMIN"]} userRole={"ADMIN"}>
                    <MobileAdminPositiveBehavior />
                  </AuthRoute>
                }
              />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
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
                element={
                  <AuthRoute allowedRoles={["TEACHER"]} userRole={"TEACHER"}>
                    <TeacherDashboard />
                  </AuthRoute>
                }
              />
              <Route
                path="/forms/ftc-closure"
                element={<FailureToComplete />}
              />
              <Route
                path="/admin/archived"
                element={
                  <GlobalArchivedPunishmentPanel
                    filter="PENDING"
                    roleType="admin"
                  />
                }
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
        </NotificationProvider>
      </Router>
    </div>
  );
}

export default App;
