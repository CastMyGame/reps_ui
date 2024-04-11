import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { IncidentByTypePieChart } from "./charts/pieCharts/incidentsByType";
import { get } from "../../../../utils/api/api";

const TeacherStudentPanel = ({ setPanelName, data = [] }) => {
  const [listOfStudents, setListOfStudents] = useState([]);
  const [studentDisplay, setStudentDisplay] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get("student/v1/allStudents"); // Pass the headers option with the JWT token
        setListOfStudents(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const fetchStudentData = async (studentEmail) => {
    try {
      const response = await get(
        `punish/v1/student/punishments/${studentEmail}`
      );
      if (response != null) {
        setStudentData(response);
        setStudentDisplay(true);
        console.log(response + "Student Data");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
    fetchStudentData(x.studentEmail);
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

  return (
    <>
      {studentDisplay && studentData.length === 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: 300,
            left: 0,
            width: "100%",
            height: "25%",
          }}
          className="modal-overlay"
        >
          <div
            style={{
              height: "80%",
              width: "80%",
              position: "relative",
              backgroundColor: "white", // Adjust background color as needed
              padding: "20px", // Adjust padding as needed
              borderRadius: "8px", // Add border radius as needed
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Add box shadow as needed
            }}
            className="modal-content"
          >
            <div className="modal-header">
              <h1>Student has No punishments</h1>
            </div>
            <div style={{ padding: "10px" }} className="modal-buttons">
              <button
                onClick={() => {
                  setStudentDisplay(false);
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generatePDF(studentData);
                  console.log(studentData + "Student Data");
                }}
                style={{ backgroundColor: "#CF9FFF" }}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
      {studentDisplay && studentData.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          className="modal-overlay"
        >
          <div
            style={{
              height: "80%",
              width: "80%",
              position: "relative",
              backgroundColor: "white", // Adjust background color as needed
              padding: "20px", // Adjust padding as needed
              borderRadius: "8px", // Add border radius as needed
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Add box shadow as needed
            }}
            className="modal-content"
          >
            <div className="modal-header">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div className="box-left">
                  <div className="student-info-box">
                    <div
                      style={{ display: "flex", backgroundColor: "" }}
                      className="icon"
                    >
                      <AccountBoxIcon style={{ fontSize: "100px" }} />
                    </div>
                    <h4 style={{ textAlign: "left" }}>
                      {studentData[0].firstName} {studentData[0].lastName}
                    </h4>
                    <div className="details-box">
                      <div style={{ textAlign: "left" }}>
                        Email: {studentData[0].studentEmail}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        Phone: {studentData[0].studentPhoneNumber}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        Grade: {studentData[0].grade}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        Address: {studentData[0].address}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{ color: "white", marginLeft: "auto" }}
                  className="box-right"
                >
                  <IncidentByTypePieChart data={studentData[0].student} />
                </div>
              </div>
            </div>
            <div style={{ height: "320px" }} className="modal-body-student">
              <TableContainer
                style={{ height: "300px", backgroundColor: "white" }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "5%" }}>Status</TableCell>
                      <TableCell style={{ width: "45%" }}>
                        Description
                      </TableCell>
                      <TableCell style={{ width: "15%" }}>Date</TableCell>
                      <TableCell style={{ width: "35%" }}>Infraction</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentData.map((student, index) => (
                      <TableRow
                        style={{
                          background: index % 2 === 0 ? "lightgrey" : "white",
                        }}
                        key={index}
                      >
                        <TableCell style={{ width: "25%" }}>
                          {student.status}
                        </TableCell>
                        <TableCell style={{ width: "25%" }}>
                          {student.infractionDescription}
                        </TableCell>
                        <TableCell style={{ width: "25%" }}>
                          {student.timeCreated}
                        </TableCell>
                        <TableCell style={{ width: "25%" }}>
                          {student.infractionName}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            <div style={{ padding: "10px" }} className="modal-buttons">
              <button
                onClick={() => {
                  setStudentDisplay(false);
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generatePDF(studentData);
                }}
                style={{ backgroundColor: "#CF9FFF" }}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          backgroundColor: "rgb(25, 118, 210)",
          marginTop: "10px",
          marginBlock: "5px",
        }}
      >
        <Typography
          color="white"
          variant="h6"
          style={{
            flexGrow: 1,
            outline: "1px solid  white",
            padding: "5px",
            fontSize: 36,
            fontWeight: "bolder",
          }}
        >
          Students Overview
        </Typography>
      </div>

      <TableContainer
        component={Paper}
        style={{
          maxHeight: hasScroll ? "400px" : "auto",
          overflowY: hasScroll ? "scroll" : "visible",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </TableRow>
            <TableRow>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Name
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Email
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Grade
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Phone Number
              </TableCell>
              {/* <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Actions
            </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((x, key) => (
                <TableRow
                  className="page-scroll"
                  key={key}
                  onClick={() => {
                    handleProfileClick(x);
                  }}
                >
                  <TableCell>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <AccountCircleIcon
                        style={{
                          fontSize: "2rem", // Adjust the size as needed
                          color: "rgb(25, 118, 210)", // Change the color to blue
                        }}
                      />
                      <span
                        style={{
                          fontSize: 18,
                        }}
                      >
                        {x.firstName} {x.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {x.studentEmail}
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {x.grade}
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {x.studentPhoneNumber}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan="5"
                  style={{
                    fontSize: 18,
                    fontWeight: "lighter",
                    fontStyle: "italic",
                  }}
                >
                  No open assignments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TeacherStudentPanel;
