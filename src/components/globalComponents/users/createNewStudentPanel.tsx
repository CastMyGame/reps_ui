import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import axios from "axios";
import Select, { SingleValue } from "react-select";
import { baseUrl } from "../../../utils/jsonData";

import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import Container from "@mui/material/Container";
import { Student } from "src/types/school";

// Define the correct type for options
type SelectOption = {
  value: string;
  label: string;
};

const CreateNewStudentPanel = () => {
  const [errorDisplay, setErrorDisplay] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successDisplay, setSuccessDisplay] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [studentForm, setStudentForm] = useState<Student>({
    firstName: "",
    lastName: "",
    address: "",
    guidanceEmail: "",
    parentEmail: "",
    studentEmail: "",
    adminEmail: "",
    parentPhoneNumber: "",
    studentPhoneNumber: "",
    grade: "",
    points: 0,
    school: "",
    currency: 0,
    spotters: [""],
  });

  const defaultTheme = createTheme();

  const studentGradeLevelOptions: SelectOption[] = [
    { value: "8", label: "Grade 8" },
    { value: "9", label: "Grade 9" },
    { value: "10", label: "Grade 10" },
    { value: "11", label: "Grade 11" },
    { value: "12", label: "Grade 12" },
  ];

  const resetForm = () => {
    setStudentForm({
      firstName: "",
      lastName: "",
      address: "",
      guidanceEmail: "",
      parentEmail: "",
      studentEmail: "",
      adminEmail: "",
      parentPhoneNumber: "",
      studentPhoneNumber: "",
      grade: "",
      points: 0,
      school: "",
      currency: 0,
      spotters: [""],
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    event.preventDefault();

    axios
      .post(`${baseUrl}/student/v1/newStudent`, studentForm, {
        headers: headers,
      })
      .then(function (res) {
        setSuccessDisplay(true);
        setSuccessMessage("Student Add");
        setTimeout(() => {
          setSuccessDisplay(false);
        }, 3000);
        resetForm();
      })
      .catch(function (error) {
        console.error(error);
        const errorMessage =
          error.response.status === 500 ? "Bad Request" : "Other Error";
        setErrorDisplay(true);
        setErrorMessage(errorMessage);
        setTimeout(() => {
          setErrorDisplay(false);
        }, 2000);
      });
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "rgb(25, 118, 210)",
          marginTop: "10px",
          marginBlock: "5px",
        }}
      >
        <Typography
          color="white"
          variant="h6"
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Add Student to Record
        </Typography>
      </div>

      <div className="page-container">
        <div className="lrKTG">
          <div className="form-container">
            <div className="M7eMe">Create New Student</div>

            <div className="md0UAd" aria-hidden="true" dir="auto">
              * Indicates required question
            </div>
            {successDisplay && (
              <span style={{ background: "green" }}> {successMessage}</span>
            )}
            {errorDisplay && (
              <span style={{ background: "pink" }}> {errorMessage}</span>
            )}

            <ThemeProvider theme={defaultTheme}>
              <Container component="main">
                <CssBaseline />
                <Box
                  sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography component="h1" variant="h5">
                    Create New Student
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{ mt: 1 }}
                  >
                    <label htmlFor="selectStudent">Select Student *</label>

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      onChange={(event) => {
                        const enteredValue = event.target.value;
                        setStudentForm((prev) => ({
                          ...prev,
                          firstName: enteredValue, // Replace "newFirstName" with the actual value you want to set
                        }));
                      }}
                      id="firstName"
                      label="First Name"
                      name="firstName"
                      autoComplete="firstName"
                      autoFocus
                      InputLabelProps={{
                        sx: {
                          "&.Mui-focused": {
                            color: "white",
                            marginTop: "-10px",
                          },
                        },
                      }}
                    />

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      onChange={(event) => {
                        const enteredValue = event.target.value;
                        setStudentForm((prev) => ({
                          ...prev,
                          lastName: enteredValue,
                        }));
                      }}
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="lastName"
                      autoFocus
                      InputLabelProps={{
                        sx: {
                          "&.Mui-focused": {
                            color: "white",
                            marginTop: "-10px",
                          },
                        },
                      }}
                    />

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      onChange={(event) => {
                        const enteredValue = event.target.value;
                        setStudentForm((prev) => ({
                          ...prev,
                          guidanceEmail: enteredValue,
                        }));
                      }}
                      id="guidanceEmail"
                      label="Guidance Email"
                      name="guidanceEmail"
                      autoFocus
                      InputLabelProps={{
                        sx: {
                          "&.Mui-focused": {
                            color: "white",
                            marginTop: "-10px",
                          },
                        },
                      }}
                    />

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      onChange={(event) => {
                        const enteredValue = event.target.value;
                        setStudentForm((prev) => ({
                          ...prev,
                          parentEmail: enteredValue,
                        }));
                      }}
                      id="parentEmail"
                      label="Parent Email"
                      name="parentEmail"
                      autoFocus
                      InputLabelProps={{
                        sx: {
                          "&.Mui-focused": {
                            color: "white",
                            marginTop: "-10px",
                          },
                        },
                      }}
                    />

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      onChange={(event) => {
                        const enteredValue = event.target.value;
                        setStudentForm((prev) => ({
                          ...prev,
                          studentEmail: enteredValue,
                        }));
                      }}
                      id="studentEmail"
                      label="Student Email"
                      name="studentEmail"
                      autoFocus
                      InputLabelProps={{
                        sx: {
                          "&.Mui-focused": {
                            color: "white",
                            marginTop: "-10px",
                          },
                        },
                      }}
                    />

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      onChange={(event) => {
                        const enteredValue = event.target.value;
                        setStudentForm((prev) => ({
                          ...prev,
                          adminEmail: enteredValue,
                        }));
                      }}
                      id="adminEmail"
                      label="Admin Email"
                      name="adminEmail"
                      autoFocus
                      InputLabelProps={{
                        sx: {
                          "&.Mui-focused": {
                            color: "white",
                            marginTop: "-10px",
                          },
                        },
                      }}
                    />

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      onChange={(event) => {
                        const enteredValue = event.target.value;
                        setStudentForm((prev) => ({
                          ...prev,
                          address: enteredValue,
                        }));
                      }}
                      id="address"
                      label="Address"
                      name="address"
                      autoFocus
                      InputLabelProps={{
                        sx: {
                          "&.Mui-focused": {
                            color: "white",
                            marginTop: "-10px",
                          },
                        },
                      }}
                    />

                    <Select
                      name="studentGrade"
                      options={studentGradeLevelOptions}
                      placeholder="Grade"
                      value={studentGradeLevelOptions.find(
                        (option) => option.value === studentForm.grade
                      )}
                      onChange={(value: SingleValue<SelectOption>) => {
                        if (value) {
                          setStudentForm((prev) => ({
                            ...prev,
                            grade: value.value,
                          }));
                        }
                      }}
                      isSearchable={true}
                    />

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      onChange={(event) => {
                        const enteredValue = event.target.value;
                        setStudentForm((prev) => ({
                          ...prev,
                          parentPhoneNumber: enteredValue,
                        }));
                      }}
                      id="parentPhone"
                      label="Parent Phone"
                      name="parentPhone"
                      autoFocus
                      InputLabelProps={{
                        sx: {
                          "&.Mui-focused": {
                            color: "white",
                            marginTop: "-10px",
                          },
                        },
                      }}
                    />

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      onChange={(event) => {
                        const enteredValue = event.target.value;
                        setStudentForm((prev) => ({
                          ...prev,
                          studentPhoneNumber: enteredValue,
                        }));
                      }}
                      id="studentPhone"
                      label="Student Phone"
                      name="studentPhone"
                      autoFocus
                      InputLabelProps={{
                        sx: {
                          "&.Mui-focused": {
                            color: "white",
                            marginTop: "-10px",
                          },
                        },
                      }}
                    />

                    <br />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              </Container>
            </ThemeProvider>
          </div>
        </div>
      </div>
    </>
  );
};
export default CreateNewStudentPanel;
