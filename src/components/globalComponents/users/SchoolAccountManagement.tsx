import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import ClassUpdate from "../components/generic-components/classUpdate";
import { Employee } from "../../../types/school";
import { UserModel } from "../../../types/school";
import { api } from "../../../utils/api/http";
import {
  accountError,
  invitationLabel,
  accountRoles,
  accountSchool,
  accountStatus,
  isSelf,
  STAFF_ROLES,
  supportedStaff,
} from "../../../utils/accountAdministration";

function AccountControls({
  user,
  busy,
  onRoles,
  onEnabled,
  onInvite,
  onClasses,
}: {
  user: UserModel;
  busy: boolean;
  onRoles: (roles: string[]) => void;
  onEnabled: () => void;
  onInvite: () => void;
  onClasses: () => void;
}) {
  const [roles, setRoles] = useState(accountRoles(user));
  useEffect(() => setRoles(accountRoles(user)), [user]);
  const self = isSelf(user);
  const editable = supportedStaff(user) && !self;
  const changed = [...roles].sort().join() !== accountRoles(user).sort().join();
  return (
    <Box
      component="article"
      sx={{
        border: "1px solid #aaa",
        borderRadius: 2,
        p: 2,
        my: 2,
        overflowWrap: "anywhere",
      }}
    >
      <Typography component="h3">
        {user.firstName} {user.lastName} {self && "(you)"}
      </Typography>
      <p>{user.username}</p>
      <p>{accountSchool(user) || "School not listed"}</p>
      <p>
        <strong>{accountStatus(user)}</strong>
      </p>
      {user.enabled === false && (
        <p>
          Login and password reset are blocked. Approve access after confirming school
          membership. This account may be awaiting first activation or may have
          been deactivated previously.
        </p>
      )}
      <p>Setup invitation: {invitationLabel(user)}</p>
      {user.enabled && supportedStaff(user) && <Button disabled={busy} onClick={onInvite}>Send setup invitation</Button>}
      {user.enabled !== false && supportedStaff(user) && <Button disabled={busy} onClick={onClasses}>Manage classes</Button>}
      <p>Current roles: {accountRoles(user).join(", ") || "Unknown"}</p>
      {editable ? (
        <fieldset disabled={busy}>
          <legend>Staff roles for {user.username}</legend>
          {STAFF_ROLES.map((role) => (
            <FormControlLabel
              key={role}
              label={role}
              control={
                <Checkbox
                  checked={roles.includes(role)}
                  onChange={(_, checked) =>
                    setRoles((current) =>
                      checked
                        ? [...current, role]
                        : current.filter((r) => r !== role),
                    )
                  }
                />
              }
            />
          ))}
          <Button
            disabled={busy || !roles.length || !changed}
            onClick={() => onRoles(roles)}
          >
            Save roles
          </Button>
        </fieldset>
      ) : (
        <p>
          {self
            ? "You cannot change your own roles or account access."
            : "Student and unsupported role combinations cannot be converted to staff here."}
        </p>
      )}
      {!self && user.enabled !== undefined && (
        <Button disabled={busy} onClick={onEnabled}>
          {user.enabled ? "Deactivate account" : "Activate account"}
        </Button>
      )}
    </Box>
  );
}

export default function SchoolAccountManagement() {
  const [classTeacher, setClassTeacher] = useState<Employee>();
  const [users, setUsers] = useState<UserModel[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [needsReload, setNeedsReload] = useState(false);
  const lock = useRef(false);
  const administrator =
    sessionStorage.getItem("role") === "ADMIN" &&
    !!sessionStorage.getItem("email")?.trim();
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<UserModel[]>("/users/v1/users");
      if (!Array.isArray(response.data)) throw new Error("Invalid response");
      setUsers(response.data);
      setNeedsReload(false);
    } catch (failure) {
      setUsers([]);
      setNeedsReload(true);
      setError(accountError(failure));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (administrator) void load();
  }, [administrator, load]);
  const update = async (user: UserModel, roles?: string[]) => {
    if (!administrator || isSelf(user) || lock.current || needsReload) return;
    if (
      roles &&
      (!supportedStaff(user) ||
        !roles.length ||
        roles.some((r) => !STAFF_ROLES.includes(r)))
    )
      return;
    const action = roles
      ? `Save roles ${roles.join(", ")} for`
      : user.enabled
        ? "Deactivate"
        : "Activate";
    if (
      !window.confirm(
        `${action} ${user.username}?${!roles && user.enabled ? " Login will be disabled; records will be retained." : ""}`,
      )
    )
      return;
    lock.current = true;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const path = `/users/v1/users/${encodeURIComponent(user.id)}`;
      if (roles)
        await api.put(
          `${path}/roles`,
          roles.map((role) => ({ role })),
        );
      else await api.put(`${path}/enabled`, { enabled: !user.enabled }); // Successful response has no body.
      setMessage("Account update saved.");
      await load();
    } catch (failure) {
      setNeedsReload(true);
      setError(accountError(failure));
    } finally {
      lock.current = false;
      setLoading(false);
    }
  };
  const invite = async (user: UserModel) => {
    if (!administrator || lock.current || needsReload || !user.enabled || !supportedStaff(user)) return;
    if (!window.confirm(`Send a new setup email to ${user.username}? Check the mailbox first if an earlier send was unconfirmed.`)) return;
    lock.current = true; setLoading(true); setMessage(""); setError("");
    try { await api.post(`/accounts/v1/${encodeURIComponent(user.id)}/invitation`); await load(); setMessage("Invitation request recorded. Check the saved invitation status; this is not proof of delivery."); }
    catch (failure) { setError(accountError(failure)); setNeedsReload(true); }
    finally { lock.current = false; setLoading(false); }
  };
  const manageClasses = async (user: UserModel) => {
    if (lock.current || !administrator) return;
    lock.current = true; setLoading(true); setError(""); setClassTeacher(undefined);
    try { const result = await api.get<Employee>(`/employees/v1/employees/email/${encodeURIComponent(user.username)}`); setClassTeacher(result.data); }
    catch (failure) { setError(accountError(failure)); }
    finally { lock.current = false; setLoading(false); }
  };
  if (!administrator)
    return (
      <Alert severity="warning">
        Only school administrators can manage accounts. Sign in with an
        authorized administrator account.
      </Alert>
    );
  return (
    <section aria-label="School account management">
      <Typography component="h2" variant="h5">
        School account access
      </Typography>
      <p>
        Manage school accounts. Staff may hold Teacher, Guidance and Admin roles
        together. Student accounts remain Student. Deactivation retains records.
      </p>
      <Alert severity="info">
        Pending activation and inactive accounts share the same disabled state
        here. Verify the account before activating it.
      </Alert>
      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}
      <Button disabled={loading} onClick={() => void load()}>
        Reload accounts
      </Button>
      {loading && <p role="status">Loading…</p>}
      <label>
        Search accounts{" "}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {classTeacher && <section aria-label="Teacher class management"><h3>Classes for {classTeacher.email}</h3><Button onClick={() => setClassTeacher(undefined)}>Close classes</Button><ClassUpdate teacher={classTeacher} onUpdated={setClassTeacher} setPanelName={() => {}} /></section>}
      {users
        .filter((user) =>
          `${user.firstName} ${user.lastName} ${user.username}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
        )
        .map((user) => (
          <AccountControls
            key={user.id}
            user={user}
            busy={loading || needsReload}
            onRoles={(roles) => void update(user, roles)}
            onEnabled={() => void update(user)}
            onInvite={() => void invite(user)}
            onClasses={() => void manageClasses(user)}
          />
        ))}
      {!loading && !error && !users.length && <p>No school accounts found.</p>}
    </section>
  );
}
