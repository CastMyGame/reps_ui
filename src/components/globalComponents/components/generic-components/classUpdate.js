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
  const [loading, setLoading] = useState(false);

  // Set the first class in teacher's class roster when component mounts
  useEffect(() => {
    if (teacher && teacher.classes && teacher.classes.length > 0) {
      const firstClass = teacher.classes[0]; // Select the first class
      setSelectedClass(firstClass);
      setClassName(firstClass.className);
      setPeriodSelected(firstClass.classPeriod);
      setStudentEmails(
        firstClass.classRoster.map((student) => student.studentEmail)
      );
    }
  }, [teacher]);

  useEffect(() => {
    setTeacherEmailSelected(sessionStorage.getItem("email"));
  }, [teacherEmailSelected]);

  // Fetch all students to populate the list of available students
  useEffect(() => {
    const url = `${baseUrl}/student/v1/allStudents`;
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    axios
      .get(url, { headers })
      .then(function (response) {
        setListOfStudents(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  // Handle adding/removing students from class roster
  const handleAddStudent = () => {
    setStudentEmails([...studentEmails, ""]);
  };

  const handleRemoveStudent = (index) => {
    setStudentEmails(studentEmails.filter((_, i) => i !== index));
  };

  const handleStudentChange = (e, index) => {
    const updatedEmails = [...studentEmails];
    updatedEmails[index] = e.target.value;
    setStudentEmails(updatedEmails);
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    // Prepare the payload for the API request
    const classRoster = studentEmails.map((email) => ({ studentEmail: email }));

    const payload = {
      classToUpdate: {
        className: className,
        classPeriod: periodSelected,
        classRoster: classRoster,
        punishmentsThisWeek: 0, // Default value
      },
    };

    axios
      .post(`${baseUrl}/employees/v1/updateClass/${teacher.email}`, payload, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
        },
      })
      .then(function (res) {
        setTimeout(() => {
          setLoading(false);
          window.alert(`Class has been updated`);
        }, 1000);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Update Class</h3>
        {/* Class Name */}
        <label>Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        {/* Class Period */}
        <label>Class Period</label>
        <select
          value={periodSelected}
          onChange={(e) => setPeriodSelected(e.target.value)}
        >
          <option value="">Select Period</option>
          {[
            "block1",
            "block2",
            "block3",
            "block4",
            "period1",
            "period2",
            "period3",
            "period4",
            "period5",
            "period6",
            "period7",
            "period8",
            "period9",
          ].map((period) => (
            <option key={period} value={period}>
              {period}
            </option>
          ))}
        </select>

        {/* Students (Email addresses) */}
        <label>Students (Email addresses)</label>
        {studentEmails.map((student, index) => (
          <div key={index}>
            <select
              value={student}
              onChange={(e) => handleStudentChange(e, index)}
            >
              <option value="">Select a student</option>
              {listOfStudents.map((studentOption) => (
                <option
                  key={studentOption.studentEmail}
                  value={studentOption.studentEmail}
                >
                  {studentOption.firstName} {studentOption.lastName} -{" "}
                  {studentOption.studentEmail}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => handleRemoveStudent(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddStudent}>
          Add Student
        </button>

        {/* Submit and Cancel buttons */}
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        <button onClick={() => setPanelName("classUpdate")}>Cancel</button>
      </div>
    </div>
  );
};

export default ClassUpdate;
