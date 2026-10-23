import { useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { handleLogout } from "../../../utils/api/api";
import SchoolAccountManagement from "../../globalComponents/users/SchoolAccountManagement";
import "../admin-mobile-v2.css";
const MobileAdminManageStaff = () => {
  const navigate = useNavigate();
  return <main className="mobile-admin-v2-app">
    <header className="mobile-admin-v2-header">
      <button type="button" onClick={() => navigate("/m/admin")} aria-label="Back to admin home"><ArrowBackRoundedIcon /></button>
      <div><span>REPS</span><h1>Manage staff</h1></div>
      <button type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button>
    </header>
    <section className="mobile-admin-v2-content"><SchoolAccountManagement /></section>
  </main>;
};
export default MobileAdminManageStaff;
