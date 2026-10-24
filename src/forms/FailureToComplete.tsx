import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../utils/jsonData";
import Select, { SingleValue } from "react-select";
import { dateCreateFormat } from "../helperComponents/helperComponents";
import { Student } from "src/types/school";
import { TeacherReferral } from "src/types/responses";

const FailureToComplete = () => {
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
    if (!email) { setListOfInfractions([]); return; }
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const student=findStudentByEmail(email || "");
    const open=listOfInfractions.filter(record => record.status !== "CLOSED" && !record.archived);
    if (!student || open.length !== 1) {
      setErrorDisplay(true); setErrorMessage("Select the exact open record below to confirm completion."); return;
    }
    void handleClose(open[0].punishmentId);
  };

  const handleClose = async (punishmentId: string) => {
    setErrorDisplay(false);
    try {
      await axios.post(`${baseUrl}/punish/v1/close/${encodeURIComponent(punishmentId)}`, null,
        {headers:{Authorization:"Bearer " + sessionStorage.getItem("Authorization")}});
      setListOfInfractions(records => records.filter(record => record.punishmentId !== punishmentId));
      window.alert("The selected work-completion record was marked completed.");
    } catch {
      setErrorDisplay(true);setErrorMessage("Completion was not confirmed. Retry the selected record or ask an authorized staff member to review it.");
    }
  };

  return (
    <div className="page-container">
      <div className="lrKTG">
        <div className="form-container" style={{ width: "100%" }}>
          <form onSubmit={handleSubmit}>
            {errorDisplay && <p role="alert">{errorMessage}</p>}
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
              <label htmlFor="selectStudent">Select the student *</label>
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
