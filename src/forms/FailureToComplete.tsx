import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../utils/jsonData";
import Select, { SingleValue } from "react-select";
import { dateCreateFormat } from "../helperFunctions/helperFunctions";
import { Student } from "src/types/school";
import { TeacherReferral } from "src/types/responses";

const FailureToComplete = () => {
  const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{
    value: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [listOfInfractions, setListOfInfractions] = useState<TeacherReferral[]>(
    []
  );

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .get(`${baseUrl}/student/v1/allStudents`, { headers })
      .then(function (response) {
        setListOfStudents(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .get(`${baseUrl}/punish/v1/student/${email}`, { headers })
      .then(function (response) {
        setListOfInfractions(response.data);
      })
      .catch(function (error) {
        setListOfInfractions([]);

        console.error(error);
      });
  }, [email]);

  const selectOptions = listOfStudents.map((student) => ({
    value: student.studentEmail, // Use a unique value for each option
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
    firstName: student.firstName,
    lastName: student.lastName,
  }));

  // Handle the selection change

  function findStudentByEmail(email: string) {
    const foundStudent = listOfStudents.find(
      (student) => student.studentEmail === email
    );
    return foundStudent || null; // Returns the found student or null if not found
  }

  const handleSelect = (
    data: SingleValue<{ value: string; firstName: string; lastName: string }>
  ) => {
    if (!data) {
      setSelectedOptions(null);
      setFirstName("");
      setLastName("");
      setEmail("");
      return;
    }

    setSelectedOptions(data);
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setEmail(data.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailPattern.test(email ?? "")) {
      setErrorDisplay(true);
      setErrorMessage("Please enter a valid email address");
      return; // Do not proceed with submission
    }

    const foundStudent = findStudentByEmail(email ?? "");
    if (foundStudent) {
      let payload = {
        studentEmail: email,
        infractionName: "Failure to Complete Work",
      };

      const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };

      axios
        .post(`${baseUrl}/punish/v1/punishId/close`, payload, {
          headers: headers,
        })
        .then(function (res) {
          window.alert(
            `You Work Has been Recorded for  ${payload.studentEmail}`
          );
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      setErrorDisplay(true);
      setErrorMessage("Student Not Found in System");
      setTimeout(() => {
        setErrorDisplay(false);
      }, 2000);
    }
  };

  const handleClose = (punishmentId: string) => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .post(`${baseUrl}/punish/v1/close/${punishmentId}`, null, {
        headers: headers,
      })
      .then(function (res) {
        window.alert(`You Assigment Has been marked Completed for  ${email}`);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  return (
    <div className="page-container">
      <div className="lrKTG">
        <div className="form-container" style={{ width: "100%" }}>
          <form onSubmit={handleSubmit}>
            <h1 className="instructions">Failure To Complete Work Closure</h1>
            <div className="M7eMe">Student Work Completion Form</div>
            <h5>
              {" "}
              This form will be used to close out the "Failure to Complete Work"
              punishment for the specified student. After clicking the "Mark as
              Completed" button there is no further action that needs to be
              taken.{" "}
            </h5>

            <div className="md0UAd" aria-hidden="true" dir="auto">
              * Indicates required question
            </div>
            <div className="question-container">
              <label htmlFor="selectStudent">Enter The Student's Email *</label>
              <Select
                name="selectStudent"
                options={selectOptions}
                placeholder="Select Student"
                value={selectedOptions}
                onChange={handleSelect}
                isSearchable={true}
              />
            </div>
            {/* <div className='question-container'>
              <label htmlFor="email">Enter The Teacher's Email *</label>
              <input
                type="email"
                id="teacherEmail"
                name="teacherEmail"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                required
              />
            </div> */}
            <hr></hr>
            <button type="submit">Submit</button>
          </form>
          List of Infractions
          <table className="my-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date Created</th>
                <th>Teacher</th>
                <th>Infraction Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {listOfInfractions.map((x, key) => {
                const student = listOfStudents.find(
                  (student) => student.studentEmail === x.studentEmail
                );
                return (
                  <tr key={key.valueOf()}>
                    <td>
                      {student
                        ? `${student.firstName} ${student.lastName}`
                        : "Unknown Student"}
                    </td>
                    <td>{dateCreateFormat(x.timeCreated)}</td>
                    <td>{x.teacherEmail}</td>
                    <td>{x.infractionDescription}</td>
                    <td>{x.status}</td>
                    <td>
                      <button onClick={() => handleClose(x.punishmentId)}>
                        Mark Completed
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FailureToComplete;
