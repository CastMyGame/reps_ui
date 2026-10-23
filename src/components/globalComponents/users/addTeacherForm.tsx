import axios from "axios";
import { accountError, requireCreatedTeacher, teacherAccessInstructions } from "../../../utils/accountAdministration";
import React, { useEffect, useRef, useState } from "react";
import { baseUrl } from "../../../utils/jsonData";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { AdminOverviewDto } from "src/types/responses";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MuiAlert>
>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface AddTeacherProps {
  adminDto: AdminOverviewDto;
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

const AddTeacherForm: React.FC<AddTeacherProps> = ({ adminDto }) => {
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    parentPhoneNumber: false,
    studentEmail: false,
    parentEmail: false,
    guidanceEmail: false,
    address: false,
    grade: false,
    studentPhoneNumber: false,
  });

  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [school, setSchool] = useState("");

  useEffect(() => {
    setSchool(adminDto.school.schoolName);
  }, [adminDto]);

  const [registrationSuccessMessage, setRegistrationSuccessMessage] =
    useState(false);
  const [type, setType] = useState("student");

  const handleTypeToggle = () => {
    setRegistrationSuccessMessage(false);
    setRequestError("");
    if (type === "student") {
      setType("employee");
    }
    if (type === "employee") {
      setType("student");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setRequestError("");
    setRegistrationSuccessMessage(false);
    const data = new FormData(event.currentTarget);

    //Check for missing fields
    let errors = {
      firstName: false,
      lastName: false,
      email: false,
      parentPhoneNumber: false,
      studentEmail: false,
      parentEmail: false,
      guidanceEmail: false,
      address: false,
      grade: false,
      studentPhoneNumber: false,
    };

    // Check for empty fields and set errors
    if (data.get("firstName") === "") {
      errors.firstName = true;
    }
    if (data.get("lastName") === "") {
      errors.lastName = true;
    }
    if (data.get("studentEmail") === "") {
      errors.studentEmail = true;
    }
    if (data.get("parentEmail") === "") {
      errors.parentEmail = true;
    }
    if (data.get("parentPhoneNumber") === "") {
      errors.parentPhoneNumber = true;
    }
    if (data.get("guidanceEmail") === "") {
      errors.guidanceEmail = true;
    }
    if (data.get("address") === "") {
      errors.address = true;
    }
    if (data.get("grade") === "") {
      errors.grade = true;
    }
    if (data.get("studentPhoneNumber") === "") {
      errors.studentPhoneNumber = true;
    }

    // Set formErrors state to trigger error messages
    setFormErrors(errors);

    // If there are errors, do not submit the form
    if (Object.values(errors).some((error) => error)) {
      setTimeout(() => {
        setFormErrors({
          firstName: false,
          lastName: false,
          email: false,
          parentPhoneNumber: false,
          studentEmail: false,
          parentEmail: false,
          guidanceEmail: false,
          address: false,
          grade: false,
          studentPhoneNumber: false,
        });
      }, 2000);
      return;
    }

    //reset errors

    let payload;
    if (type === "student") {
      payload = {
        firstName: data.get("firstName"),
        lastName: data.get("lastName"),
        grade: data.get("grade"),
        studentEmail: data.get("studentEmail"),
        parentEmail: data.get("parentEmail"),
        parentPhoneNumber: data.get("parentPhoneNumber"),
        studentPhoneNumber: data.get("studentPhoneNumber"),
        address: data.get("address"),
        guidanceEmail: data.get("guidanceEmail"),
        school: school,
      };
    }
    if (type === "employee") {
      payload = {
        firstName: data.get("firstName"),
        lastName: data.get("lastName"),
        email: data.get("studentEmail"),
        school,
      };
    }

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    // Submit the form data if there are no errors

    const url = `${baseUrl}${type === "student" ? "/student/v1/newStudent" : "/employees/v1/employees"}`;

    submittingRef.current = true;
    setSubmitting(true);
    axios
      .post(url, payload, { headers })
      .then(function (res) {
        if (type === "employee") requireCreatedTeacher(res.data);
        setRegistrationSuccessMessage(true);
      })
      .catch(function (error) {
        setRequestError(error.response ? accountError(error) : error.message?.startsWith("Teacher creation") ? error.message : accountError(error));
      }).finally(() => { submittingRef.current = false; setSubmitting(false); });
  };

  const handleCloseSnackbar = (
    event: React.SyntheticEvent<any, Event> | Event, // For Snackbar
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
  };

  // This wrapper function is for the Alert component to match the expected type
  const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
    return;
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <h1 style={{ textAlign: "center" }}>
        Add {type === "student" ? "Student" : "Teacher"}
      </h1>
      <p style={{ textAlign: "center", color: "white" }}>
        <button disabled={submitting} onClick={() => handleTypeToggle()}>
          Click Here to Add {type === "student" ? "Teacher" : "Student"}
        </button>
      </p>
      {type === "employee" && <MuiAlert severity="info">{teacherAccessInstructions}</MuiAlert>}
      {requestError && <MuiAlert severity="error">{requestError}</MuiAlert>}
      <Container component="main" sx={{ width: "100%" }}>
        <CssBaseline />
        <Box
          sx={{
            padding: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Snackbar
            className="" // Add a custom class
            open={registrationSuccessMessage}
            autoHideDuration={2000}
            onClose={handleCloseSnackbar}
          >
            <Alert
              onClose={handleAlertClose}
              severity="success"
              sx={{ width: "100%" }}
            >
              {type === "student" ? "Student" : "Teacher"} Added!
            </Alert>
          </Snackbar>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3, height: "65vh", overflowY: "scroll" }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  // autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  error={formErrors.firstName} // Add error prop
                  helperText={formErrors.firstName && "First Name is required"} // Add error message
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  // autoComplete="family-name"
                  error={formErrors.lastName} // Add error prop
                  helperText={formErrors.lastName && "Last Name is required"} // Add error message
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="studentEmail"
                  label={
                    type === "employee"
                      ? `Email Address`
                      : "Student Email Address"
                  }
                  name="studentEmail"
                  // autoComplete="email"
                  error={formErrors.studentEmail} // Add error prop
                  helperText={formErrors.studentEmail && "Email is required"} // Add error message
                />
              </Grid>

              {type === "student" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="parentEmail"
                      label="Parent Email Address"
                      name="parentEmail"
                      // autoComplete="email"
                      error={formErrors.parentEmail} // Add error prop
                      helperText={formErrors.parentEmail && "Email is required"} // Add error message
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="guidanceEmail"
                      label="Guidance Email Address"
                      name="guidanceEmail"
                      // autoComplete="email"
                      error={formErrors.guidanceEmail} // Add error prop
                      helperText={
                        formErrors.guidanceEmail && "Email is required"
                      } // Add error message
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="text"
                      label="Address"
                      name="address"
                      // autoComplete="address"
                      error={formErrors.address} // Add error prop
                      helperText={formErrors.address && "Address is required"} // Add error message
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="number"
                      label="Grade"
                      name="grade"
                      error={formErrors.grade} // Add error prop
                      helperText={formErrors.grade && "Grade is required"} // Add error message
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="parentPhoneNumber"
                      label="Parent Phone Number"
                      type="text"
                      id="parentPhoneNumber"
                      error={formErrors.parentPhoneNumber} // Add error prop
                      helperText={
                        formErrors.parentPhoneNumber && "Phone is required"
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="studentPhoneNumber"
                      label="Student Phone Number"
                      type="text"
                      id="studentPhoneNumber"
                      error={formErrors.studentPhoneNumber} // Add error prop
                      helperText={
                        formErrors.studentPhoneNumber && "Phone is required"
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>
            <Button
              disabled={submitting}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
            <Grid container justifyContent="flex-end"></Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AddTeacherForm;
