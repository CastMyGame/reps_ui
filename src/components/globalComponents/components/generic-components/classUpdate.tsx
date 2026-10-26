import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Autocomplete, TextField } from "@mui/material";
import { baseUrl } from "src/utils/jsonData";
import { Employee, Student } from "src/types/school";
import {
  classKey,
  rosterError,
  CLASS_PERIODS,
  requireSavedRoster,
} from "src/utils/roster";

interface Props {
  setPanelName: (value: string) => void;
  teacher?: Employee;
  onUpdated?: (teacher: Employee) => void;
}
const ClassUpdate = ({ teacher, onUpdated }: Props) => {
  const [current, setCurrent] = useState(teacher);
  const [students, setStudents] = useState<Student[]>([]);
  const [choice, setChoice] = useState("");
  const [name, setName] = useState("");
  const [period, setPeriod] = useState("");
  const [roster, setRoster] = useState<string[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
  });
  const select = (key: string, source = current) => {
    setChoice(key);
    const item = source?.classes?.find((c) => classKey(c) === key);
    setName(item?.className ?? "");
    setPeriod(item?.classPeriod ?? "");
    setRoster([...(item?.classRoster ?? [])]);
  };
  useEffect(() => {
    setCurrent(teacher);
    select(
      teacher?.email === current?.email &&
        teacher?.classes?.some((c) => classKey(c) === choice)
        ? choice
        : teacher?.classes?.[0]
          ? classKey(teacher.classes[0])
          : "new",
      teacher,
    );
  }, [teacher]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    axios
      .get(`${baseUrl}/student/v1/enrollment-directory`, { headers: headers() })
      .then((r) => setStudents(r.data))
      .catch((e) => setError(rosterError(e)));
  }, []);
  const accept = (employee: Employee) => {
    setCurrent(employee);
    onUpdated?.(employee);
  };
  const save = async (remove = false) => {
    if (inFlight.current || !current?.email) return;
    if (!name.trim() || !period.trim()) {
      setError("Class name and period are required.");
      return;
    }
    if (remove && !window.confirm(`Delete ${name}, period ${period}?`)) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    const payload = {
      expectedRosterRevision: current.rosterRevision ?? 0,
      createOnly: choice === "new",
      classToUpdate: {
        className: name.trim(),
        classPeriod: period.trim(),
        classRoster: roster,
      },
    };
    try {
      const url = `${baseUrl}/employees/v1/${remove ? "deleteClass" : "updateClass"}/${current.email}`;
      const response = remove
        ? await axios.post(url, payload, { headers: headers() })
        : await axios.put(url, payload, { headers: headers() });
      requireSavedRoster(
        response.data,
        payload.classToUpdate,
        remove ? null : roster,
      );
      accept(response.data);
      if (remove)
        select(
          response.data.classes?.[0]
            ? classKey(response.data.classes[0])
            : "new",
          response.data,
        );
      else setChoice(classKey(payload.classToUpdate));
      setMessage(
        remove
          ? "Class deleted."
          : choice === "new"
            ? "Class created."
            : "Roster saved.",
      );
    } catch (e) {
      setError(rosterError(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const reload = async () => {
    if (
      inFlight.current ||
      !current?.email ||
      !window.confirm(
        "Reload the saved roster? Unsaved edits will be replaced.",
      )
    )
      return;
    inFlight.current = true;
    setBusy(true);
    try {
      const response = await axios.get(
        `${baseUrl}/employees/v1/employees/email/${encodeURIComponent(current.email)}`,
        { headers: headers() },
      );
      accept(response.data);
      select(
        response.data.classes?.some((c: any) => classKey(c) === choice)
          ? choice
          : "new",
        response.data,
      );
      setError("");
    } catch (e) {
      setError(rosterError(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  return (
    <section style={{ padding: 20 }}>
      <h2>Class roster</h2>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <fieldset
          disabled={busy}
          style={{
            border: 0,
            padding: 0,
            minWidth: 0,
            display: "grid",
            gap: 12,
          }}
        >
          <label>
            Class
            <select
              aria-label="Class"
              value={choice}
              onChange={(e) => select(e.target.value)}
              disabled={busy}
            >
              {(current?.classes ?? [])
                .filter((c) => c.className?.trim())
                .map((c, index) => (
                  <option key={`${classKey(c)}-${index}`} value={classKey(c)}>
                    {c.className} · {c.classPeriod}
                  </option>
                ))}
              <option value="new">Create New Class</option>
            </select>
          </label>
          {choice === "new" && (
            <>
              <label htmlFor="className">Class Name</label>
              <input
                id="className"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label>
                Class period
                <select
                  aria-label="Class period"
                  required
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="">Select a period</option>
                  {CLASS_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <Autocomplete
            options={students.filter(
              (s) =>
                !roster.some(
                  (email) =>
                    email.toLowerCase() === s.studentEmail.toLowerCase(),
                ),
            )}
            value={selected}
            onChange={(_, value) => setSelected(value)}
            getOptionLabel={(s) =>
              `${s.firstName} ${s.lastName} ${s.studentEmail}`
            }
            renderInput={(params) => (
              <TextField {...params} label="Select or Search for a Student" />
            )}
          />
          <button
            type="button"
            disabled={busy || !selected}
            onClick={() => {
              if (selected) {
                setRoster([...roster, selected.studentEmail]);
                setSelected(null);
              }
            }}
          >
            Add Student
          </button>
          <ul>
            {roster.map((email) => (
              <li key={email}>
                {
                  students.find(
                    (s) => s.studentEmail.toLowerCase() === email.toLowerCase(),
                  )?.firstName
                }{" "}
                {email}{" "}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setRoster(roster.filter((e) => e !== email))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p>
            Removing a student only removes this class enrollment. The student
            account and other classes are retained.
          </p>
          <button type="submit" disabled={busy}>
            Submit
          </button>{" "}
          <button
            type="button"
            disabled={busy || choice === "new"}
            onClick={() => void save(true)}
          >
            Delete Class
          </button>{" "}
          <button type="button" disabled={busy} onClick={() => void reload()}>
            Reload classes
          </button>
        </fieldset>
      </form>
    </section>
  );
};
export default ClassUpdate;
