import { useState, useEffect, useRef } from "react";
import {
  TextField,
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { IncidentByTypePieChart } from "src/components/globalComponents/dataDisplay/incidentsByType";
import { get } from "../../../utils/api/api";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css"; // Using "alpine" for a modern theme

const TeacherStudentPanel = ({ setPanelName, data = [] }) => {
  console.log(data, " THE DATA ");
  const [listOfStudents, setListOfStudents] = useState([]);
  const [listOfSchool, setListOfSchool] = useState([]);
  const [studentDisplay, setStudentDisplay] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [punishmentData, setPunishmentData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(""); // State for selected grade
  const [spotEmail, setSpotEmail] = useState("");

  // Fetch all students data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get("student/v1/allStudents");
        setListOfSchool(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // Fetch specific student data when clicking the student name
  const fetchStudentData = async (studentEmail) => {
    try {
      const response = await get(
        `punish/v1/student/punishments/${studentEmail}`
      );
      if (response != null) {
        console.log("Student Data:", response); // Ensure student data is fetched
        setStudentData(response);
        setStudentDisplay(true);
        // Handle the display of fetched student data here
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addSpotter = async () => {
    if (studentData != null) {
      const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };

      const payload = {
        spotters: [sessionStorage.getItem("email")],
        studentEmail: [spotEmail],
      };

      const url = `${baseUrl}/student/v1/addAsSpotter`;
      axios
        .put(url, payload, { headers })
        .then((response) => {
          setStudentDisplay(false);
          window.alert(
            `You have been successfully added as a spotter for: ${spotEmail} `
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  useEffect(() => {
    // Filter the data based on the search query
    const filteredRecords = listOfStudents.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();

      return fullName.includes(searchQuery.toLowerCase());
    });
    setFilteredData(filteredRecords);
  }, [listOfStudents, searchQuery]);

  const handleProfileClick = (x) => {
    fetchStudentData(x.data.studentEmail);
    setSpotEmail(x.data.studentEmail);
  };

  const pdfRef = useRef();

  const generatePDF = (studentData) => {
    const pdf = new jsPDF();
    // Add logo
    const logoWidth = 50; // Adjust the width of the logo as needed
    const logoHeight = 50; // Adjust the height of the logo as needed
    const logoX = 130; // Adjust the X coordinate of the logo as needed
    const logoY = 15; // Adjust the Y coordinate of the logo as needed

    //https://medium.com/dont-leave-me-out-in-the-code/5-steps-to-create-a-pdf-in-react-using-jspdf-1af182b56cee
    //Resource for adding image and how pdf text works
    var image = new Image();
    image.src = "/burke-logo.png";
    pdf.addImage(image, "PNG", logoX, logoY, logoWidth, logoHeight);

    // Add student details section
    pdf.setFontSize(12);
    pdf.rect(15, 15, 180, 50);
    pdf.text(`${studentData[0].firstName} ${studentData[0].lastName}`, 20, 20);
    pdf.text(`Email: ${studentData[0].studentEmail}`, 20, 30);
    pdf.text(`Phone: ${studentData[0].studentPhoneNumber}`, 20, 40);
    pdf.text(`Grade: ${studentData[0].grade}`, 20, 50);
    pdf.text(`Address: ${studentData[0].address}`, 20, 60);

    // Add punishment details table
    pdf.autoTable({
      startY: 70, // Adjust the Y-coordinate as needed
      head: [["Status", "Description", "Date", "Infraction"]],
      body: studentData.map((student) => [
        student.status,
        student.infraction.infractionDescription,
        student.timeCreated,
        student.infraction.infractionName,
      ]),
    });

    // Save or open the PDF
    pdf.save("student_report.pdf");
  };

  const hasScroll = listOfStudents.length > 10;

  // Process and format the list of students and referral data
  useEffect(() => {
    const processData = () => {
      const studentsArray = [];

      data.teacher.classes.forEach((classEntry) => {
        classEntry.classRoster.forEach((student) => {
          const foundStudent = listOfSchool.find(
            (s) => s.studentEmail === student.studentEmail
          );
          if (foundStudent) {
            studentsArray.push({
              fullName: `${foundStudent.firstName} ${foundStudent.lastName}`,
              studentEmail: student.studentEmail,
              grade: foundStudent.grade,
              teacherManagedReferrals: data.writeUpResponse.filter(
                (w) => w.studentEmail === student.studentEmail
              ).length,
              officeManagedReferrals: data.officeReferrals.filter(
                (o) => o.studentEmail === student.studentEmail
              ).length,
              className: classEntry.className, // Optionally add class information if needed
            });
          }
        });
      });

      setListOfStudents(studentsArray);
    };

    if (data) {
      processData();
    }
  }, [data, listOfSchool]);

  // Filter data based on search query and selected grade
  useEffect(() => {
    const filteredRecords = listOfStudents.filter((student) => {
      const fullName = `${student.fullName}`.toLowerCase();
      const matchesQuery = fullName.includes(searchQuery.toLowerCase());
      const matchesGrade =
        selectedGrade === "" || student.grade === selectedGrade;
      return matchesQuery && matchesGrade;
    });
    setFilteredData(filteredRecords);
  }, [listOfStudents, searchQuery, selectedGrade]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
  };

  // Define column definitions, with clickable student name
  const columnDefs = [
    {
      headerName: "Student Name",
      field: "fullName",
      onCellClicked: (params) => {
        handleProfileClick(params);
        console.log("params ", params);
      },
    },
    { headerName: "Grade", field: "grade" },
    {
      headerName: "Teacher Managed Referrals",
      field: "teacherManagedReferrals",
    },
    { headerName: "Office Managed Referrals", field: "officeManagedReferrals" },
  ];

  return (
    <>
      {/* Modal for No Punishment Data */}
      {studentDisplay && studentData && studentData.length === 0 && (
        <div
          className="modal-overlay"
          style={{
            display: "flex",
            justifyContent: "center",
            position: "fixed",
            top: 300,
            left: 0,
            width: "100%",
          }}
        >
          <div
            className="modal-content"
            style={{
              width: "80%",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="modal-header">
              <h1>Student has No punishments</h1>
            </div>
            <div className="modal-buttons" style={{ padding: "10px" }}>
              <button onClick={() => setStudentDisplay(false)}>Cancel</button>
              <button
                onClick={() => generatePDF(studentData)}
                style={{ backgroundColor: "#CF9FFF" }}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Student Data Display */}
      {studentDisplay && studentData && studentData.length > 0 && (
        <div
          className="modal-overlay"
          style={{
            display: "flex",
            justifyContent: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <div
            className="modal-content"
            style={{
              maxHeight: "80rem",
              width: "80%",
              backgroundColor: "#25444C",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              overflowY: "hidden",
            }}
          >
            <div
              className="modal-header"
              style={{ display: "flex", flexDirection: "row" }}
            >
              <div className="box-left">
                <AccountBoxIcon style={{ fontSize: "100px" }} />
                <h4>
                  {studentData[0].firstName} {studentData[0].lastName}
                </h4>
                <div className="details-box">
                  <p>Email: {studentData[0].studentEmail}</p>
                  <p>Phone: {studentData[0].studentPhoneNumber}</p>
                  <p>Grade: {studentData[0].grade}</p>
                  <p>Address: {studentData[0].address}</p>
                </div>
              </div>
              <div
                className="box-right"
                style={{ marginLeft: "auto", color: "white" }}
              >
                <IncidentByTypePieChart data={studentData} />
              </div>
            </div>
            <div className="modal-body-student" style={{ height: "320px" }}>
              <TableContainer
                style={{ height: "300px", backgroundColor: "white" }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Infraction</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentData.map((student, index) => (
                      <TableRow
                        key={index}
                        style={{
                          background: index % 2 === 0 ? "lightgrey" : "white",
                        }}
                      >
                        <TableCell>{student.status}</TableCell>
                        <TableCell>{student.infractionDescription}</TableCell>
                        <TableCell>{student.timeCreated}</TableCell>
                        <TableCell>{student.infractionName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="modal-buttons" style={{ padding: "10px" }}>
              <button onClick={() => setStudentDisplay(false)}>Cancel</button>
              <button onClick={addSpotter}>Spot this Student</button>
              <button
                onClick={() => generatePDF(studentData)}
                style={{ backgroundColor: "#CF9FFF" }}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class-Specific AgGridReact Tables */}
      <div style={{ backgroundColor: "rgb(25, 118, 210)", marginTop: "10px" }}>
        {data.teacher.classes.map((classEntry, index) => {
          // Filter students in this class's classRoster
          const studentsInClass = filteredData.filter((student) =>
            classEntry.classRoster.some(
              (rosterStudent) =>
                rosterStudent.studentEmail === student.studentEmail
            )
          );

          return (
            <div key={index} style={{ marginBlock: "20px" }}>
              <h3 style={{ color: "white", padding: "10px" }}>
                {classEntry.className}
              </h3>
              <div
                className="ag-theme-alpine"
                style={{ width: "100%" }}
              >
                <AgGridReact
                  rowData={studentsInClass}
                  columnDefs={columnDefs}
                  domLayout="autoHeight"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TeacherStudentPanel;
