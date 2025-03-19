import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Autocomplete,
  TextField,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import "./teacher_profile_modal.css";
import { baseUrl } from "src/utils/jsonData";
import axios from "axios";
import TeacherProfileIncidentsByStudentTable from "./teacher_profile_widget_incident_table";
import { TeacherProfileIncidentByStudentPieChart } from "./teacher_profile_widget_incident-pie";
import { TeacherProfileSpotter } from "./teacher_profile_widget_spotter";
import { dateCreateFormat } from "src/helperFunctions/helperFunctions";
import { AdminOverviewDto, TeacherReferral } from "src/types/responses";
import { TeacherData } from "src/types/menus";
import { Employee, Student } from "src/types/school";

interface TeacherDetailsProps {
  activeTeacher: TeacherData;
  setDisplayBoolean: (value: boolean) => void;
  adminDto: AdminOverviewDto;
}

export const TeacherDetailsModal: React.FC<TeacherDetailsProps> = ({
  activeTeacher,
  setDisplayBoolean,
  adminDto,
}) => {
  const [teacherProfileData, setTeacherProfileData] = useState<
    TeacherReferral[]
  >([]);
  const [studentNames, setStudentNames] = useState<
    { value: string; label: string }[]
  >([]);
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);
  const [displaySpotterAdd, setDisplaySpotterAdd] = useState(false);

  const selectedTeacher = adminDto?.teachers?.find(
    (teacher: Employee) =>
      teacher.firstName + " " + teacher.lastName === activeTeacher.fullName
  );

  const url = `${baseUrl}/student/v1/allStudents`;

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setListOfStudents(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [url]);

  const selectOptions = listOfStudents.map((student) => ({
    value: student.studentEmail, // Use a unique value for each option
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
  }));

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const url = `${baseUrl}/punish/v1/punishments/`;
    axios
      .get(url, { headers })
      .then((res) => {
        const results = res.data.filter(
          (rec: TeacherReferral) => rec.teacherEmail === selectedTeacher?.email
        );
        setTeacherProfileData(results);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [selectedTeacher]);

  const addSpotter = () => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const student_emails: string[] = [];
    studentNames.forEach((x) => {
      student_emails.push(x.value);
    });

    const payload = {
      spotters: [selectedTeacher?.email],
      studentEmail: student_emails,
    };

    const url = `${baseUrl}/student/v1/addAsSpotter`;
    axios
      .put(url, payload, { headers })
      .then(() => {
        window.alert(
          `You have been successfully added as a spotter for the students entered. You will receive all REPS emails for these students when they are sent. `
        );
        setTimeout(() => {
          setDisplaySpotterAdd(false);
          setStudentNames([]);
        }, 1000);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="details-modal-container">
      <div className="details-modal-container-inner">
        <div className="details-modal-header">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div className="header-section-left">
              <div>
                <h2 style={{ textAlign: "left" }}>
                  {selectedTeacher?.firstName} {selectedTeacher?.lastName}
                </h2>
              </div>
              <div style={{ textAlign: "left" }}>
                Email: {selectedTeacher?.email}
              </div>
            </div>
            <div className="header-section-table">
              <TeacherProfileIncidentsByStudentTable
                writeUps={teacherProfileData}
                listOfStudents={listOfStudents}
              />
            </div>
            <div className="header-section-table">
              <TeacherProfileIncidentByStudentPieChart
                writeUps={teacherProfileData}
                listOfStudents={listOfStudents}
              />
            </div>
            <div className="header-section-right">
              <TeacherProfileSpotter
                teacher={selectedTeacher?.email}
                setDisplaySpotterAdd={setDisplaySpotterAdd}
                displaySpotterAdd={displaySpotterAdd}
              />
            </div>
          </div>
          {displaySpotterAdd && (
            <div className="spot-student-modal">
              <p style={{ textAlign: "center" }}>Add Students To Spot</p>
              <Autocomplete
                multiple
                className="student-dropdown"
                id="demo-multiple-chip"
                value={studentNames}
                onChange={(event, newValue) => setStudentNames(newValue)}
                options={selectOptions} // Pass the selectOptions array here
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="student-dropdown"
                    InputLabelProps={{ style: { fontSize: 18 } }}
                    label="Select Students"
                    sx={{ width: "100%", backgroundColor: "white" }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.label}
                      sx={{ fontSize: 18 }}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
              <button
                className="btn-add-student-roster"
                onClick={() => addSpotter()}
              >
                Add Students
              </button>
              <button
                className="btn-close-student-roster"
                onClick={() => setDisplaySpotterAdd(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>

        {adminDto ? (
          <div className="profile-modal-body">
            <TableContainer
              style={{ height: "250px", backgroundColor: "white" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "25%", fontSize: 18 }}>
                      Status
                    </TableCell>
                    <TableCell style={{ width: "25%", fontSize: 18 }}>
                      Description
                    </TableCell>
                    <TableCell style={{ width: "25%", fontSize: 18 }}>
                      Date
                    </TableCell>
                    <TableCell style={{ width: "25%", fontSize: 18 }}>
                      Infraction
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teacherProfileData.map((teacher, index) => (
                    <TableRow
                      style={{
                        background: index % 2 === 0 ? "lightgrey" : "white",
                      }}
                      key={index.valueOf()}
                    >
                      <TableCell style={{ width: "25%", fontSize: 16 }}>
                        {teacher.status}
                      </TableCell>
                      <TableCell style={{ width: "25%", fontSize: 14 }}>
                        {teacher.infractionDescription}
                      </TableCell>
                      <TableCell style={{ width: "25%", fontSize: 18 }}>
                        {dateCreateFormat(teacher.timeCreated)}
                      </TableCell>
                      <TableCell style={{ width: "25%", fontSize: 18 }}>
                        {teacher.infractionName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ) : (
          <div>No Data available</div>
        )}

        <div className="modal-buttons-teacher-profile">
          <button
            onClick={() => {
              if (typeof setDisplayBoolean === "function") {
                setDisplayBoolean(false);
              }
            }}
          >
            Close
          </button>
          {/* <button
            onClick={() => {
              // generatePDF(activeTeacher, teacherProfileData);
            }}
            style={{ backgroundColor: "#CF9FFF" }}
          >
            Print
          </button> */}
        </div>
      </div>
    </div>
  );
};
