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
} from "@mui/material";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { baseUrl } from "src/utils/jsonData";

export function ManageSpottersPopup({
  setContactUsDisplayModal,
  contactUsDisplayModal,
}) {
  const [warningToast, setWarningToast] = useState(false);
  const [selectOption, setSelectOption] = useState([]);
  const [studentNames, setStudentNames] = useState([]);
  const [spottedStudents, setSpottedStudents] = useState([]);

  const modalRef = useRef(null); // Create a ref for the modal div

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  // Fetch data on load
  useEffect(() => {
    axios.get(`${baseUrl}/student/v1/allStudents`, { headers }).then((res) => {
      setSelectOption(res.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get(
        `${baseUrl}/student/v1/findBySpotter/${sessionStorage.getItem("email")}`,
        { headers }
      )
      .then((res) => {
        setSpottedStudents(res.data);
      });
  }, []);

  // Close modal if `contactUsDisplayModal` changes to anything else
  useEffect(() => {
    if (contactUsDisplayModal !== "spotter") {
      setContactUsDisplayModal("");
    }
  }, [contactUsDisplayModal, setContactUsDisplayModal]);

  // Click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setContactUsDisplayModal("login");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectOptions = selectOption.map((student) => ({
    value: student.studentEmail,
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`,
  }));

  const addSpotter = () => {
    const student_emails = [];
    studentNames.map((x) => {
      student_emails.push(x.value);
      return student_emails;
    });

    const payload = {
      spotters: [sessionStorage.getItem("email")],
      studentEmail: student_emails,
    };

    const url = `${baseUrl}/student/v1/addAsSpotter`;
    axios
      .put(url, payload, { headers })
      .then(() => {
        window.alert(
          `You have been successfully added as a spotter for the students entered. You will receive all REPS emails for these students when they are sent. `
        );
        setTimeout(() => {
          setContactUsDisplayModal("login");
        }, 1000);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const removeSpotter = () => {
    const student_emails = [];
    studentNames.map((x) => {
      student_emails.push(x.value);
      return student_emails;
    });

    const payload = {
      spotters: [sessionStorage.getItem("email")],
      studentEmail: student_emails,
    };
    const url = `${baseUrl}/student/v1/removeAsSpotter`;
    axios
      .put(url, payload, { headers })
      .then(() => {
        window.alert(
          `You have been successfully removed as a spotter for the students entered. You will no longer receive REPS emails for these students. `
        );
        setTimeout(() => {
          setContactUsDisplayModal("login");
        }, 1000);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleClose = (reason) => {
    if (reason === "clickaway") {
      return;
    }
    setContactUsDisplayModal("login");
    setWarningToast(false);
  };

  return (
    <>
      <Snackbar
        open={warningToast}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Your request has been successfully submitted
        </Alert>
      </Snackbar>

      <div
        ref={modalRef} // Attach the modal ref here
        className="pop-modal"
        style={{
          zIndex: 2,
        }}
      >
        <div className="header" style={{ marginBottom: "20px" }}>
          <Typography variant="h5">
            Choose which students you want to spot or stop spotting students you
            are currently spotting
          </Typography>
        </div>
        <div>
          <Typography variant="h5" style={{ textAlign: "left" }}>
            Students you are currently spotting:
          </Typography>
        </div>

        {spottedStudents.map((option) => (
          <div key={option.studentEmail}>
            {option.firstName} {option.lastName}
          </div>
        ))}

        <FormControl
          fullWidth
          variant="outlined"
          style={{ marginBottom: "20px", zIndex: 9999 }}
        >
          <InputLabel id="topic-label">Choose Student</InputLabel>
          <Autocomplete
            multiple
            className="student-dropdown"
            id="demo-multiple-chip"
            value={studentNames}
            onChange={(event, newValue) => setStudentNames(newValue)}
            options={selectOptions}
            getOptionLabel={(option) => option.label}
            inputLabelProps={{ style: { fontSize: 18 } }}
            renderInput={(params) => (
              <TextField
                {...params}
                className="student-dropdown"
                inputLabelProps={{ style: { fontSize: 18 } }}
                label="Select Students"
                sx={{ width: "100%" }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  sx={{ fontSize: 18 }}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </FormControl>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={!studentNames}
            variant="contained"
            color="primary"
            onClick={addSpotter}
          >
            Spot Students
          </Button>
          <Button
            disabled={!studentNames}
            variant="contained"
            color="primary"
            onClick={removeSpotter}
          >
            Remove Students
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => setContactUsDisplayModal("login")}
          >
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
