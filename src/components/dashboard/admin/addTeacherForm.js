import axios from "axios";
import React, { useState } from "react";
import { baseUrl } from "../../../utils/jsonData";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { Select } from "@mui/material";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function AddTeacherForm(props) {
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    schoolName: false,
    parentPhoneNumber: false,
    studentPhoneNumber: false,
    studentEmail: false,
    parentEmail: false,
    grade: false,
    address: false,
    guidenceEmail: false,
  });

  const [registrationSuccessMessage, setRegistrationSuccessMessage] =
    useState(false);
  const [type, setType] = useState("student");

  const handleTypeToggle = () => {
    if (type === "student") {
      setType("employee");
    }
    if (type === "employee") {
      setType("student");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    //Check for missing fields
    let errors = {
      firstName: false,
      lastName: false,
      email: false,
      schoolName: false,
      parentPhoneNumber: false,
      studentPhoneNumber: false,
      studentEmail: false,
      parentEmail: false,
      grade: false,
      address: false,
      guidenceEmail: false,
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
    if (data.get("guidenceEmail") === "") {
      errors.guidenceEmail = true;
    }
    if (data.get("schoolName") === "") {
      errors.schoolName = true;
    }
    if (data.get("parentPhoneNumber") === "") {
      errors.parentPhoneNumber = true;
    }
    if (data.get("studentPhoneNumber") === "") {
      errors.studentPhoneNumber = true;
    }
    if (data.get("address") === "") {
      errors.address = true;
    }
    if (data.get("grade") === "") {
      errors.grade = true;
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
          schoolName: false,
          parentPhoneNumber: false,
          studentPhoneNumber: false,
          studentEmail: false,
          parentEmail: false,
          grade: false,
          address: false,
          guidenceEmail: false,
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
        guidenceEmail: data.get("guidenceEmail"),
        school: data.get("schoolName"),
      };
    }
    if (type === "employee") {
      payload = {
        firstName: data.get("firstName"),
        lastName: data.get("lastName"),
        email: data.get("studentEmail"),
        school: data.get("schoolName"),
      };
    }

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    // Submit the form data if there are no errors

    const url = `${baseUrl}${type === "student" ? "/student/v1/newStudent" : "/employees/v1/employees"}`;

    axios
      .post(url, payload, { headers })
      .then(function (res) {
        setRegistrationSuccessMessage(true);
        setTimeout(() => {
          setRegistrationSuccessMessage(true);
          // props.setAddTeacherModalOpen(false)
        }, 1500);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      // props.setAddTeacherModalOpen(false)
      return;
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <h1 style={{ textAlign: "center" }}>
        Add {type === "student" ? "Student" : "Teacher"}
      </h1>
      <p style={{ textAlign: "center", color: "white" }}>
        <button onClick={() => handleTypeToggle()}>
          Click Here to Add {type === "student" ? "Teacher" : "Student"}
        </button>
      </p>
      <Container component="main" width="lg">
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
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity="success"
              sx={{ width: "100%" }}
            >
              {type === "student" ? "Student" : "Teacher"} Added!
            </Alert>
          </Snackbar>
          <Box
            height="65vh"
            overflowY="scroll"
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
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
                <Select
                  required
                  fullWidth
                  variant="outlined"
                  name="schoolName"
                  label="School Name"
                  type="text"
                  id="schoolName"
                  defaultValue={"Burke"}
                  error={formErrors.schoolName} // Add error prop
                  helperText={
                    formErrors.schoolName && "School Name  is required"
                  }
                >
                  <option value={"Burke"}>Burke</option>
                </Select>
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
                      required
                      fullWidth
                      id="guidenceEmail"
                      label="Guidence Email Address"
                      name="guidenceEmail"
                      // autoComplete="email"
                      error={formErrors.guidenceEmail} // Add error prop
                      helperText={
                        formErrors.guidenceEmail && "Email is required"
                      } // Add error message
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
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
                      required
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
                      required
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
}
