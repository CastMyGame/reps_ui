import React, { useState, useEffect } from "react";
import axios from "axios";
import { studentProfilePatch, studentSecurityError } from "src/utils/studentSecurity";
import { useRef } from "react";
import Select, { ActionMeta, SingleValue } from "react-select";
import { baseUrl } from "src/utils/jsonData";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { Student } from "src/types/school";

const EditStudentPanel = () => {
  const inFlight = useRef(false);
  const [saving, setSaving] = useState(false);
  const administrator = (sessionStorage.getItem("roles") ?? sessionStorage.getItem("role") ?? "").includes("ADMIN");
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
    if (!studentForm || inFlight.current) return;
    inFlight.current = true; setSaving(true); setErrorMessage(""); setSuccessMessage("");
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .put(`${baseUrl}/student/v1/updateStudents`, [studentProfilePatch(studentForm, administrator)], { headers })
      .then((response) => {
        const saved = response.data?.find((s: Student) => s.studentIdNumber === studentForm.studentIdNumber);
        if (!saved || saved.profileRevision !== (studentForm.profileRevision ?? 0) + 1) throw new Error("Update was not confirmed");
        setStudentForm(saved); setSelectedStudent(saved);
        setListOfStudents(current => current.map(s => s.studentIdNumber === saved.studentIdNumber ? saved : s));
        setSuccessMessage("Student updated successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((error) => {
        setErrorMessage(studentSecurityError(error));
      }).finally(() => { inFlight.current = false; setSaving(false); });
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
            disabled={!administrator || saving}
            value={studentForm?.guidanceEmail ?? ""}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Admin Email"
            name="adminEmail"
            disabled={!administrator || saving}
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
          <Button disabled={saving} type="submit" variant="contained" sx={{ mt: 2 }}>
            Update Student
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default EditStudentPanel;
