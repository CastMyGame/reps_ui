import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";
import { Autocomplete, TextField } from "@mui/material";
import { Employee, Student } from "src/types/school";

interface ClassUpdateProps {
  setPanelName: (value: string) => void;
  teacher?: Employee;
}

const ClassUpdate: React.FC<ClassUpdateProps> = ({ setPanelName, teacher }) => {
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);
  const [teacherEmailSelected, setTeacherEmailSelected] = useState<
    string | null
  >();
  const [studentEmails, setStudentEmails] = useState<string[]>([]);
  const [className, setClassName] = useState("");
  const [periodSelected, setPeriodSelected] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null); // Selected student for adding
  const [loading, setLoading] = useState(false);
  const [isNewClass, setIsNewClass] = useState(false); // Tracks if creating a new class
  const [isModified, setIsModified] = useState(false);
  const [punishmentsThisWeek, setPunishmentsThisWeek] = useState(0);

  const [searchTerm, setSearchTerm] = useState(""); // Holds the user's input

  // Create a list of student objects from studentEmails
  const mappedStudents = studentEmails
    .map((email) =>
      listOfStudents.find((student) => student.studentEmail === email)
    )
    .filter((student) => student !== undefined); // Remove any undefined entries

  useEffect(() => {
    if (teacher?.classes && teacher?.classes?.length > 0) {
      const firstClass = teacher.classes[0];
      setClassName(firstClass.className);
      setPeriodSelected(firstClass.classPeriod);
      setStudentEmails(firstClass.classRoster); // Ensure you get an array of emails
      setPunishmentsThisWeek(firstClass.punishmentsThisWeek);
    } else {
      setClassName("");
      setPeriodSelected("");
      setStudentEmails([]); // Default empty array
      setPunishmentsThisWeek(0);
    }
  }, [teacher]);

  useEffect(() => {
    setTeacherEmailSelected(teacher?.email);
  }, [teacher?.email]);

  useEffect(() => {
    setLoading(true);
    const url = `${baseUrl}/student/v1/allStudents`;
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
    };

    axios
      .get(url, { headers })
      .then((response) => {
        setListOfStudents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleClassChange = (classId: string) => {
    if (classId === "new") {
      setIsNewClass(true);
      setClassName("");
      setPeriodSelected("");
      setStudentEmails([]);
      setPunishmentsThisWeek(0);
    } else {
      setIsNewClass(false);
      const selectedClass = teacher?.classes?.find(
        (cls) => cls.className === classId
      );
      if (selectedClass) {
        setClassName(selectedClass.className);
        setPeriodSelected(selectedClass.classPeriod);
        setStudentEmails(selectedClass.classRoster); // Already a list of email strings
      }
    }
  };

  const handleAddStudent = () => {
    if (
      selectedStudent?.studentEmail &&
      !studentEmails.includes(selectedStudent.studentEmail)
    ) {
      setStudentEmails([...studentEmails, selectedStudent.studentEmail]); // Store emails only
      setSelectedStudent(null); // Reset selection
      setIsModified(true);
    } else if (!selectedStudent) {
      alert("Please select a student to add.");
    } else {
      alert("Student is already in the class.");
    }
  };

  const handleRemoveStudent = (email: string) => {
    setStudentEmails(
      studentEmails.filter((studentEmail) => studentEmail !== email)
    );
    setIsModified(true);
  };

  const handleDeleteClass = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (
      window.confirm(
        `Are you sure you want to delete the class "${className}"?`
      )
    ) {
      setLoading(true);
      const deleteClass = teacher?.classes.find(
        (cls) => cls.className === className
      );

      const leftoverClasses = teacher?.classes.filter(
        (cls) => cls.className !== className
      );

      const payload = {
        classToUpdate: {
          className,
          classPeriod: periodSelected,
          classRoster: deleteClass?.classRoster ?? [],
          punishmentsThisWeek: punishmentsThisWeek,
        },
      };

      axios
        .post(
          `${baseUrl}/employees/v1/deleteClass/${teacherEmailSelected}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
            },
          }
        )
        .then(() => {
          setLoading(false);
          alert("Class deleted successfully.");
          setClassName(""); // Reset class selection
          if (teacher) {
            teacher.classes = leftoverClasses ?? [];
          }
          setPeriodSelected("");
          setStudentEmails([]);
        })
        .catch((error) => {
          setLoading(false);
          console.error(error);
          alert("Error deleting class. Please try again.");
        });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (studentEmails.length === 0) {
      alert("Class roster cannot be empty.");
      return;
    }
    setLoading(true);

    if (isNewClass) {
      // Validate unique class name
      const classExists = teacher?.classes.some(
        (cls) => cls.className.toLowerCase() === className.toLowerCase()
      );
      if (classExists) {
        setLoading(false);
        alert("Class name already exists. Please choose another name.");
        return;
      }
      setIsModified(false);
    }

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
        alert(
          isNewClass ? "New class has been created." : "Class has been updated."
        );
        if (isNewClass) {
          // Add the new class to teacher's classes
          teacher?.classes.push({
            className: className,
            classPeriod: periodSelected,
            classRoster: studentEmails,
            punishmentsThisWeek: 0,
          });
        }
        setPanelName("classUpdate"); // Redirect or reset as needed
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        alert("Error updating class roster. Please try again.");
      });
  };

  const classPeriodSelectOptions = [
    { value: "exchange", label: "Class Exchange" },
    { value: "afterSchool", label: "After School" },
    { value: "lunch", label: "Lunch" },
    { value: "period1", label: "Period 1" },
    { value: "period2", label: "Period 2" },
    { value: "period3", label: "Period 3" },
    { value: "period4", label: "Period 4" },
    { value: "period5", label: "Period 5" },
    { value: "period6", label: "Period 6" },
    { value: "period7", label: "Period 7" },
    { value: "period8", label: "Period 8" },
    { value: "period9", label: "Period 9" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {isModified && (
        <div style={{ color: "red", marginTop: "10px" }}>
          You have unsaved changes. Please submit to save.
        </div>
      )}
      <h2>{isNewClass ? "Create New Class" : "Update Class"}</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        {/* Class Name Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            value={isNewClass ? "new" : className || ""}
            onChange={(e) => handleClassChange(e.target.value)}
            style={{
              flex: 1,
              padding: "8px",
              fontSize: "1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select a class</option>
            {teacher?.classes
              ?.filter((cls) => cls.className.trim() !== "")
              .map((cls) => (
                <option key={cls.className} value={cls.className}>
                  {cls.className}
                </option>
              ))}
            <option value="new">Create New Class</option>
          </select>
          <button
            type="button"
            onClick={handleDeleteClass}
            style={{
              background: "green",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "4px",
            }}
          >
            Delete Class
          </button>
        </div>

        {/* Class Name Input */}
        {isNewClass && (
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="className">Class Name</label>
            <input
              type="text"
              id="className"
              name="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Enter new class name"
              required
              style={{
                padding: "8px",
                width: "100%",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}

        {/* Class Period Dropdown */}
        {isNewClass && (
          <div style={{ marginBottom: "15px" }}>
            <select
              value={periodSelected}
              onChange={(e) => setPeriodSelected(e.target.value)}
              required
              style={{
                padding: "8px",
                width: "100%",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Select a period</option>
              {classPeriodSelectOptions.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="studentSearch">Search for a Student to Add</label>

          {/* Autocomplete Dropdown */}
          <Autocomplete
            id="studentSearch"
            options={listOfStudents.filter(
              (student) => !studentEmails.includes(student.studentEmail) // Exclude already added students
            )}
            getOptionLabel={(student) =>
              `${student.firstName || ""} ${student.lastName || ""} ${student.studentEmail || ""}`
            }
            value={selectedStudent}
            onChange={(event, newValue) => {
              setSelectedStudent(newValue);
            }}
            inputValue={searchTerm}
            onInputChange={(event, newInputValue) => {
              setSearchTerm(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select or Search for a Student"
                variant="outlined"
              />
            )}
            sx={{ width: "100%", marginTop: "8px" }}
          />

          {/* Add Student Button */}
          <button
            type="button"
            onClick={handleAddStudent}
            style={{
              background: "green",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            Add Student
          </button>
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
              <tr key={student?.studentEmail}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {student?.firstName} {student?.lastName}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {student?.studentEmail}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveStudent(student?.studentEmail ?? "")
                    }
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "8px 10px",
                      borderRadius: "4px",
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "20px",
            background: "blue",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "4px",
          }}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default ClassUpdate;
