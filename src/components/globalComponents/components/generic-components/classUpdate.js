import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";

const ClassUpdate = ({ setPanelName, teacher }) => {
  const [listOfStudents, setListOfStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [teacherEmailSelected, setTeacherEmailSelected] = useState();
  const [studentEmails, setStudentEmails] = useState([]);
  const [className, setClassName] = useState("");
  const [periodSelected, setPeriodSelected] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(""); // Selected student for the search
  const [loading, setLoading] = useState(false);

  // Initialize class and roster when component mounts
  useEffect(() => {
    if (teacher && teacher.classes && teacher.classes.length > 0) {
      const firstClass = teacher.classes[0];
      setSelectedClass(firstClass);
      setClassName(firstClass.className);
      setPeriodSelected(firstClass.classPeriod);
      setStudentEmails(firstClass.classRoster.map((student) => student));
    }
  }, [teacher]);

  useEffect(() => {
    setTeacherEmailSelected(sessionStorage.getItem("email"));
  }, [teacherEmailSelected]);

  // Update the selected class and its details
  const handleClassChange = (classId) => {
    const selected = teacher.classes.find((cls) => cls.className === classId);
    if (selected) {
      setSelectedClass(selected);
      setStudentEmails(selected.classRoster.map((student) => student));
    }
  };

  // Fetch all students for the dropdown
  useEffect(() => {
    const url = `${baseUrl}/student/v1/allStudents`;
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
    };

    axios
      .get(url, { headers })
      .then((response) => {
        setListOfStudents(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // Add a student to the class roster
  const handleAddStudent = () => {
    if (selectedStudent && !studentEmails.includes(selectedStudent)) {
      setStudentEmails([...studentEmails, selectedStudent]);
      setSelectedStudent(""); // Reset the dropdown
    } else if (!selectedStudent) {
      alert("Please select a student to add.");
    } else {
      alert("Student is already in the class.");
    }
  };

  // Remove a student from the class roster
  const handleRemoveStudent = (email) => {
    setStudentEmails(
      studentEmails.filter((studentEmail) => studentEmail !== email)
    );
  };

  // Submit form
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      classToUpdate: {
        className,
        classPeriod: periodSelected,
        classRoster: studentEmails,
      },
    };

    axios
      .put(
        `${baseUrl}/employees/v1/updateClass/${teacherEmailSelected}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
          },
        }
      )
      .then(() => {
        setLoading(false);
        alert("Class has been updated.");
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        alert("Error updating class roster. Please try again.");
      });
  };

  // Students already in the class
  const mappedStudents = listOfStudents.filter((student) =>
    studentEmails.includes(student.studentEmail)
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Update Class</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        {/* Class Name Dropdown */}
        <div style={{ marginBottom: "15px" }}>
          <label>Class Name</label>
          <select
            value={selectedClass?.className || ""}
            onChange={(e) => handleClassChange(e.target.value)}
            style={{
              padding: "8px",
              width: "100%",
              fontSize: "1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select a Class</option>
            {teacher.classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>

        {/* Class Period */}
        <div style={{ marginBottom: "15px" }}>
          <label>Class Period</label>
          <input
            type="text"
            value={selectedClass?.classPeriod || ""}
            disabled
            style={{
              padding: "8px",
              width: "100%",
              fontSize: "1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
            }}
          />
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "20px" }}>
          <label>Search for a Student to Add</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Select a student</option>
              {listOfStudents
                .filter(
                  (student) => !studentEmails.includes(student.studentEmail)
                )
                .map((student) => (
                  <option
                    key={student.studentEmail}
                    value={student.studentEmail}
                  >
                    {student.firstName} {student.lastName} -{" "}
                    {student.studentEmail}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={handleAddStudent}
              style={{
                background: "green",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "4px",
              }}
            >
              Add Student
            </button>
          </div>
        </div>

        {/* Mapped Students */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                Name
              </th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                Email
              </th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {mappedStudents.map((student) => (
              <tr key={student.studentEmail}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {student.firstName} {student.lastName}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {student.studentEmail}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(student.studentEmail)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "red",
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Form Buttons */}
        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              marginRight: "10px",
            }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => setPanelName("classUpdate")}
            style={{
              background: "grey",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassUpdate;
