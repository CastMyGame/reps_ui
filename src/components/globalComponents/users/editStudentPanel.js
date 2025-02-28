import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { baseUrl } from "src/utils/jsonData";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

const EditStudentPanel = () => {
  const [listOfStudents, setListOfStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  useEffect(() => {
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

  const handleSelectChange = (selectedOption) => {
    const student = listOfStudents.find(
      (s) => s.studentEmail === selectedOption.value
    );
    setSelectedStudent(student);
    setStudentForm(student);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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
            value={studentForm.firstName || ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={studentForm.lastName || ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Parent Email"
            name="parentEmail"
            value={studentForm.parentEmail || ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Student Email"
            name="studentEmail"
            value={studentForm.studentEmail || ""}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            label="Guidance Email"
            name="guidanceEmail"
            value={studentForm.guidanceEmail || ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Admin Email"
            name="adminEmail"
            value={studentForm.adminEmail || ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={studentForm.address || ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Parent Phone"
            name="parentPhoneNumber"
            value={studentForm.parentPhoneNumber || ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Student Phone"
            name="studentPhoneNumber"
            value={studentForm.studentPhoneNumber || ""}
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
