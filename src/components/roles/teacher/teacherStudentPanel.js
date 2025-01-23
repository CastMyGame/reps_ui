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
  const [listOfStudents, setListOfStudents] = useState([]);
  const [listOfSchool, setListOfSchool] = useState([]);
  const [studentDisplay, setStudentDisplay] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [punishmentData, setPunishmentData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(""); // State for selected grade
  const [spotEmail, setSpotEmail] = useState("");
  const [selectedClass, setSelectedClass] = useState(""); // Selected class name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (data.teacher.classes.length > 0 && !selectedClass) {
      setSelectedClass(data.teacher.classes[0].className);
    }
  }, [data.teacher.classes, selectedClass]);

  // Fetch specific student data when clicking the student name
  const fetchStudentData = async (studentEmail) => {
    try {
      const response = await get(
        `punish/v1/student/punishments/${studentEmail}`
      );
      if (response != null) {
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
      if (!data || data.length === 0) {
        setError("No email list provided");
        setLoading(false);
        return;
      }

      const fetchStudents = async () => {
        try {
          setLoading(true);

          // Extract all emails from the classRoster and ensure uniqueness
          const uniqueEmails = Array.from(
            new Set(
              data.teacher.classes.flatMap((classItem) => classItem.classRoster)
            )
          );

          const url = `${baseUrl}/student/v1/getByEmailList`;
          const response = await axios.post(
            url,
            uniqueEmails, // Sending the list of emails as the request body
            {
              headers: {
                Authorization:
                  "Bearer " + sessionStorage.getItem("Authorization"),
              },
            }
          );

          const fetchedStudents = response.data;
          const studentsArray = [];
          data.teacher.classes.forEach((classEntry) => {
            classEntry.classRoster.forEach((student) => {
              const foundStudent = fetchedStudents.find(
                (s) => s.studentEmail === student
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
                  className: classEntry.className,
                });
              }
            });
          });
          setListOfStudents(studentsArray); // Update state properly
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch students");
          setLoading(false);
        }
      };

      fetchStudents();
    };

    processData();
  }, [data, selectedClass]); // Ensure these dependencies trigger updates

  const filteredStudentData = listOfStudents.filter(
    (student) => student.className === selectedClass
  );

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
      {/* Display a message if no classes are created */}
      {data.teacher.classes.length === 1 && data.teacher.classes[0].className === "" ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2>No classes have been created yet.</h2>
          <p>Please create a class to view and manage students.</p>
        </div>
      ) : (
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
                  <button onClick={() => setStudentDisplay(false)}>
                    Cancel
                  </button>
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
                              background:
                                index % 2 === 0 ? "lightgrey" : "white",
                            }}
                          >
                            <TableCell>{student.status}</TableCell>
                            <TableCell>
                              {student.infractionDescription}
                            </TableCell>
                            <TableCell>{student.timeCreated}</TableCell>
                            <TableCell>{student.infractionName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
                <div className="modal-buttons" style={{ padding: "10px" }}>
                  <button onClick={() => setStudentDisplay(false)}>
                    Cancel
                  </button>
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

          <div>
            <label htmlFor="class-select" style={{ marginRight: "8px" }}>
              Select Class:
            </label>
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                padding: "8px",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">-- Select a Class --</option>
              {data.teacher.classes
                .filter(
                  (classEntry, index) => classEntry.className.trim() !== ""
                )
                .map((classEntry, index) => (
                  <option key={index} value={classEntry.className}>
                    {classEntry.className}
                  </option>
                ))}
            </select>

            {selectedClass && (
              <div style={{ marginTop: "20px" }}>
                <h3>{selectedClass}</h3>
                <div className="ag-theme-alpine" style={{ width: "100%" }}>
                  <AgGridReact
                    rowData={filteredStudentData}
                    columnDefs={columnDefs}
                    domLayout="autoHeight"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default TeacherStudentPanel;
