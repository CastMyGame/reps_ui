import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Snackbar,
  TextField,
  Typography,
  SnackbarCloseReason,
} from "@mui/material";
import axios from "axios";
import { studentSecurityError, requireSpotterResults } from "src/utils/studentSecurity";
import { useEffect, useState, useRef } from "react";
import { Student } from "src/types/school";
import { baseUrl } from "src/utils/jsonData";

interface ManageSpottersProps {
  setContactUsDisplayModal: (modal: string) => void;
  contactUsDisplayModal: string;
}

export const ManageSpottersPopup: React.FC<ManageSpottersProps> = ({
  setContactUsDisplayModal,
  contactUsDisplayModal,
}) => {
  const inFlight = useRef(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [warningToast, setWarningToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);
  const [studentOptions, setStudentOptions] = useState<Student[]>([]);
  const [studentNames, setStudentNames] = useState<
    { value: string; label: string }[]
  >([]);
  const [spottedStudents, setSpottedStudents] = useState<Student[]>([]);

  const modalRef = useRef<HTMLDivElement | null>(null); // Create a ref for the modal div
  const autoCompleteRef = useRef<any>(null); // Create a ref for the Autocomplete dropdown

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
    };

    // Fetch both students and spotted students together
    const fetchStudents = async () => {
      try {
        const [allStudentsRes, spottedRes] = await Promise.all([
          axios.get(`${baseUrl}/student/v1/allStudents`, { headers }),
          axios.get(
            `${baseUrl}/student/v1/findBySpotter/${sessionStorage.getItem("email")}`,
            { headers }
          ),
        ]);

        setStudentOptions(allStudentsRes.data);
        setSpottedStudents(spottedRes.data);
      } catch (error) {
        console.error(error);
        setErrorToast(true);
      }
    };

    fetchStudents();
  }, []);

  // Close modal if `contactUsDisplayModal` changes to anything else
  useEffect(() => {
    if (contactUsDisplayModal !== "spotter") {
      setContactUsDisplayModal("");
    }
  }, [contactUsDisplayModal, setContactUsDisplayModal]);

  // Click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click target is inside the modal or Autocomplete dropdown
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !(
          autoCompleteRef.current &&
          autoCompleteRef.current.contains(event.target as Node)
        )
      ) {
        setContactUsDisplayModal("spotter");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const studentDropdownOptions = studentOptions.map((student) => ({
    value: student.studentEmail,
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`,
  }));

  const handleSpotterAction = async (action: "add" | "remove") => {
    if (inFlight.current || !studentNames.length) return;
    inFlight.current = true; setSaving(true); setErrorToast(false);
    const studentEmails = studentNames.map((x) => x.value);
    const payload = {
      spotters: [sessionStorage.getItem("email")],
      studentEmail: studentEmails,
    };

    const url =
      action === "add"
        ? `${baseUrl}/student/v1/addAsSpotter`
        : `${baseUrl}/student/v1/removeAsSpotter`;
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
    };

    try {
      const result = await axios.put(url, payload, { headers });
      requireSpotterResults(result.data, studentEmails, sessionStorage.getItem("email") ?? "", action === "add");

      window.alert(
        `You have been successfully ${
          action === "add" ? "added as a spotter" : "removed as a spotter"
        } for the selected students.`
      );

      setTimeout(() => {
        setContactUsDisplayModal("");
      }, 1000);
    } catch (error) {
      setErrorMessage(studentSecurityError(error));
      setErrorToast(true);
    } finally { inFlight.current = false; setSaving(false); }
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setContactUsDisplayModal("login");
    setWarningToast(false);
  };

  const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
    setWarningToast(false);
  };

  return (
    <>
      <Snackbar
        open={warningToast}
        autoHideDuration={6000}
        onClose={() => setWarningToast(false)}
      >
        <Alert severity="success">
          Your request has been successfully submitted
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorToast}
        autoHideDuration={6000}
        onClose={() => setErrorToast(false)}
      >
        <Alert severity="error">
          {errorMessage || "Unable to load authorized students. Please retry."}
        </Alert>
      </Snackbar>

      <div ref={modalRef} className="pop-modal" style={{ zIndex: 2 }}>
        <Typography
          variant="h3"
          style={{ marginBottom: "20px", textAlign: "center" }}
        >
          Manage notifications for students in your classes or assigned guidance group
        </Typography>

        <Typography variant="h4" style={{ textAlign: "left" }}>
          Students you are currently spotting:
        </Typography>
        {spottedStudents.map((student) => (
          <Typography
            key={student.studentEmail}
            variant="h5"
            style={{ textAlign: "left" }}
          >
            {student.firstName} {student.lastName}
          </Typography>
        ))}

        <FormControl
          fullWidth
          variant="outlined"
          style={{ marginBottom: "20px", zIndex: 9999 }}
        >
          <InputLabel id="topic-label">Choose Student</InputLabel>
          <Autocomplete
            ref={autoCompleteRef}
            multiple
            className="student-dropdown"
            value={studentNames}
            onChange={(event: React.ChangeEvent<{}>, newValue: any[]) =>
              setStudentNames(newValue)
            }
            options={studentDropdownOptions}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField {...params} sx={{ width: "100%" }} />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option.label} {...getTagProps({ index })} />
              ))
            }
          />
        </FormControl>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "20px",
            padding: "10px",
          }}
        >
          <Button
            disabled={saving || studentNames.length === 0}
            variant="contained"
            color="primary"
            onClick={() => handleSpotterAction("add")}
            sx={{ fontSize: "18px", minWidth: "180px" }}
          >
            Spot Students
          </Button>
          <Button
            disabled={saving || studentNames.length === 0}
            variant="contained"
            color="secondary"
            onClick={() => handleSpotterAction("remove")}
            sx={{ fontSize: "18px", minWidth: "180px", margin: "20px" }}
          >
            Remove Students
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => setContactUsDisplayModal("")}
            sx={{ fontSize: "18px", minWidth: "180px" }}
          >
            Close
          </Button>
        </div>
      </div>
    </>
  );
};
