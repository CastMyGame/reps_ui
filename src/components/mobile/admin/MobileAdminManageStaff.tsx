import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { baseUrl } from "../../../utils/jsonData";
import { handleLogout } from "../../../utils/api/api";
import { UserModel } from "../../../types/school";
import "../admin-mobile-v2.css";

const MobileAdminManageStaff = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserModel[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const headers = useMemo(() => ({
    Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
  }), []);

  useEffect(() => {
    axios.get(`${baseUrl}/users/v1/users`, { headers })
      .then((response) => {
        const staff = (response.data as UserModel[]).filter((user) =>
          user.roles?.some((role) => role.role === "TEACHER" || role.role === "ADMIN" || role.role === "STUDENT")
        );
        setUsers(staff);
      })
      .catch(() => setError("We could not load staff. Please try again."))
      .finally(() => setLoading(false));
  }, [headers]);

  const updateRole = async (user: UserModel, role: "TEACHER" | "ADMIN" | "STUDENT") => {
    setSavingId(user.id);
    setError("");
    try {
      await axios.put(`${baseUrl}/users/v1/users/${user.id}/roles`, [{ id: "", role }], { headers });
      setUsers((current) => current.map((item) => item.id === user.id
        ? { ...item, roles: [{ ...(item.roles?.[0] || { id: "" }), role }] }
        : item
      ));
    } catch {
      setError(`We could not update ${user.firstName} ${user.lastName}'s role.`);
    } finally {
      setSavingId("");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return `${user.firstName} ${user.lastName} ${user.username}`.toLowerCase().includes(query);
  });

  return <main className="mobile-admin-v2-app">
    <header className="mobile-admin-v2-header">
      <button type="button" onClick={() => navigate("/m/admin")} aria-label="Back to admin home"><ArrowBackRoundedIcon /></button>
      <div><span>REPS</span><h1>Manage staff</h1></div>
      <button type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button>
    </header>
    <section className="mobile-admin-v2-content">
      <p className="mobile-admin-v2-eyebrow">School management</p>
      <h2>Staff access</h2>
      <p className="mobile-admin-v2-intro">Review account access and switch between Teacher, Admin, and Student for testing.</p>
      {loading ? <div className="mobile-admin-v2-loading"><CircularProgress size={28} /> Loading staff</div> : error && users.length === 0 ? <p className="mobile-admin-v2-error" role="alert">{error}</p> : <>
        {error && <p className="mobile-admin-v2-error" role="alert">{error}</p>}
        <label className="mobile-staff-search-label" htmlFor="staff-search">Search staff</label>
        <input id="staff-search" className="mobile-staff-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" autoComplete="off" />
        <div className="mobile-staff-list">
          {filteredUsers.length === 0 ? <div className="mobile-positive-empty"><GroupsRoundedIcon /><h3>{users.length === 0 ? "No staff found" : "No matches found"}</h3><p>{users.length === 0 ? "There are no teacher or admin accounts to manage." : "Try a different name or email."}</p></div> : filteredUsers.map((user) => {
            const currentRole = user.roles?.[0]?.role === "ADMIN" ? "ADMIN" : user.roles?.[0]?.role === "STUDENT" ? "STUDENT" : "TEACHER";
            return <article className="mobile-staff-card" key={user.id}>
              <div className="mobile-staff-card-heading"><div><strong>{user.firstName} {user.lastName}</strong><span>{user.username}</span></div><span className="mobile-staff-role">{currentRole}</span></div>
              <p>{user.schoolName || "School not listed"}</p>
              <label>Role<select value={currentRole} disabled={savingId === user.id} onChange={(event) => updateRole(user, event.target.value as "TEACHER" | "ADMIN" | "STUDENT")}><option value="TEACHER">Teacher</option><option value="ADMIN">Admin</option><option value="STUDENT">Student</option></select></label>
              {savingId === user.id && <small className="mobile-staff-saving">Saving role…</small>}
            </article>;
          })}
        </div>
      </>}
    </section>
  </main>;
};

export default MobileAdminManageStaff;
