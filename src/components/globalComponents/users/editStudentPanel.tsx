import React, { useState, useEffect } from "react";
import axios from "axios";
import Select, { ActionMeta, SingleValue } from "react-select";
import { baseUrl } from "src/utils/jsonData";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { Student } from "src/types/school";

const EditStudentPanel = () => {
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student>();
  const [studentForm, setStudentForm] = useState<Student>();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .get(`${baseUrl}/student/v1/allStudents`, { headers })
      .then((response) => {
        setListOfStudents(response.data || []);
      })
      .catch((error) => {
        console.error(error);
        setListOfStudents([]);
      });
  }, []);

  const selectOptions = listOfStudents.map((student) => ({
    value: student.studentEmail,
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`,
  }));

  const handleSelectChange = (
    newValue: SingleValue<{ value: string; label: string }>,
    actionMeta: ActionMeta<{ value: string; label: string }>
  ) => {
    if (newValue) {
      const student = listOfStudents.find(
        (s) => s.studentEmail === newValue.value
      );
      setSelectedStudent(student);
      setStudentForm(student);
    } else {
      setSelectedStudent(undefined); // Handle case where no student is selected
      setStudentForm(undefined); // Optionally reset the form
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setStudentForm((prev) =>
      prev ? { ...prev, [name]: value } : ({} as Student)
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .put(`${baseUrl}/student/v1/updateStudents`, [studentForm], { headers })
      .then((response) => {
        setSuccessMessage("Student updated successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((error) => {
        setErrorMessage("Failed to update student.");
        setTimeout(() => setErrorMessage(""), 3000);
      });
  };

  return (
    <Container>
      <Typography variant="h5">Edit Student</Typography>
      {successMessage && <div style={{ color: "green" }}>{successMessage}</div>}
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

      <Select
        options={selectOptions}
        onChange={handleSelectChange}
        placeholder="Select a student"
        menuPortalTarget={document.body} // Ensures dropdown is rendered at the root level
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure it stays on top
          menu: (base) => ({ ...base, zIndex: 9999 }), // Ensure menu itself is elevated
        }}
      />

      {selectedStudent && (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, position: "relative", zIndex: 1 }}
        >
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={studentForm?.firstName ?? ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={studentForm?.lastName ?? ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Parent Email"
            name="parentEmail"
            value={studentForm?.parentEmail ?? ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Student Email"
            name="studentEmail"
            value={studentForm?.studentEmail ?? ""}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            label="Guidance Email"
            name="guidanceEmail"
            value={studentForm?.guidanceEmail ?? ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Admin Email"
            name="adminEmail"
            value={studentForm?.adminEmail ?? ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={studentForm?.address ?? ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Parent Phone"
            name="parentPhoneNumber"
            value={studentForm?.parentPhoneNumber ?? ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Student Phone"
            name="studentPhoneNumber"
            value={studentForm?.studentPhoneNumber ?? ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Update Student
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default EditStudentPanel;
