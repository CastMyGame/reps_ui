import { PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { handleLogout } from "../../../utils/api/api";
import "../mobile.css";

interface MobileTeacherShellProps extends PropsWithChildren { title: string; showBack?: boolean; }

const MobileTeacherShell = ({ title, showBack = false, children }: MobileTeacherShellProps) => {
  const navigate = useNavigate();
  return <main className="mobile-teacher-app"><header className="mobile-teacher-header">
    {showBack ? <button className="mobile-icon-button" type="button" onClick={() => navigate("/m/teacher")} aria-label="Back to teacher home"><ArrowBackRoundedIcon /></button> : <div className="mobile-brand-mark" aria-hidden="true">R</div>}
    <div className="mobile-header-title"><span>REPS</span><h1>{title}</h1></div>
    <button className="mobile-icon-button" type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button>
  </header>{children}</main>;
};

export default MobileTeacherShell;
