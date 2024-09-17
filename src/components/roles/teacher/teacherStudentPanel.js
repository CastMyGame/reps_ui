import { useState, useEffect, useRef } from "react";
import { TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(""); // State for selected grade
  const [spotEmail, setSpotEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get("student/v1/allStudents"); // Pass the headers option with the JWT token
        setListOfSchool(response);
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

  // const handleProfileClick = (x) => {
  //   fetchStudentData(x.studentEmail);
  //   setSpotEmail(x.studentEmail);
  // };

  // const pdfRef = useRef();

  // const generatePDF = (studentData) => {
  //   const pdf = new jsPDF();
  //   // Add logo
  //   const logoWidth = 50; // Adjust the width of the logo as needed
  //   const logoHeight = 50; // Adjust the height of the logo as needed
  //   const logoX = 130; // Adjust the X coordinate of the logo as needed
  //   const logoY = 15; // Adjust the Y coordinate of the logo as needed

  //   //https://medium.com/dont-leave-me-out-in-the-code/5-steps-to-create-a-pdf-in-react-using-jspdf-1af182b56cee
  //   //Resource for adding image and how pdf text works
  //   var image = new Image();
  //   image.src = "/burke-logo.png";
  //   pdf.addImage(image, "PNG", logoX, logoY, logoWidth, logoHeight);

  //   // Add student details section
  //   pdf.setFontSize(12);
  //   pdf.rect(15, 15, 180, 50);
  //   pdf.text(`${studentData[0].firstName} ${studentData[0].lastName}`, 20, 20);
  //   pdf.text(`Email: ${studentData[0].studentEmail}`, 20, 30);
  //   pdf.text(`Phone: ${studentData[0].studentPhoneNumber}`, 20, 40);
  //   pdf.text(`Grade: ${studentData[0].grade}`, 20, 50);
  //   pdf.text(`Address: ${studentData[0].address}`, 20, 60);

  //   // Add punishment details table
  //   pdf.autoTable({
  //     startY: 70, // Adjust the Y-coordinate as needed
  //     head: [["Status", "Description", "Date", "Infraction"]],
  //     body: studentData.map((student) => [
  //       student.status,
  //       student.infraction.infractionDescription,
  //       student.timeCreated,
  //       student.infraction.infractionName,
  //     ]),
  //   });

  //   // Save or open the PDF
  //   pdf.save("student_report.pdf");
  // };

  // const hasScroll = listOfStudents.length > 10;

  console.log("ListOfSchool ", listOfSchool);

  useEffect(() => {
    const processData = () => {
      // Create a map to store student data
      const studentDataMap = new Map();

      // Function to get the grade for a student by their email
      const getGradeByEmail = (email) => {
        const student = listOfSchool.find(
          (student) => student.studentEmail === email
        );
        return student ? student.grade : ""; // Return grade if found, otherwise return an empty string
      };

      // Process teacher-managed referrals (writeUpResponse)
      data.writeUpResponse.forEach((teacherDTO) => {
        const email = teacherDTO.studentEmail;

        // If the student is already in the map, update their info
        if (!studentDataMap.has(email)) {
          studentDataMap.set(email, {
            fullName: `${teacherDTO.studentFirstName} ${teacherDTO.studentLastName}`,
            grade: getGradeByEmail(email), // Get the grade by studentEmail
            teacherManagedReferrals: 0,
            officeManagedReferrals: 0,
          });
        }

        // Increment the teacher-managed referral count
        const studentData = studentDataMap.get(email);
        studentData.teacherManagedReferrals += 1;
        studentDataMap.set(email, studentData);
      });

      // Process office-managed referrals (officeReferrals)
      data.officeReferrals.forEach((referral) => {
        const email = referral.studentEmail;

        // If the student isn't in the map yet, create a new entry
        if (!studentDataMap.has(email)) {
          studentDataMap.set(email, {
            fullName: `${referral.studentFirstName} ${referral.studentLastName}`,
            grade: getGradeByEmail(email), // Get the grade by studentEmail
            teacherManagedReferrals: 0,
            officeManagedReferrals: 0,
          });
        }

        // Increment the office-managed referral count
        const studentData = studentDataMap.get(email);
        studentData.officeManagedReferrals += 1;
        studentDataMap.set(email, studentData);
      });

      // Convert the map to an array to be used in rowData
      const formattedData = Array.from(studentDataMap.values());

      setListOfStudents(formattedData); // Update state with formatted data
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

  // Define column definitions
  const columnDefs = [
    { headerName: "Student Name", field: "fullName" },
    { headerName: "Grade", field: "grade" }, // Assuming you can get the grade
    {
      headerName: "Teacher Managed Referrals",
      field: "teacherManagedReferrals",
    },
    { headerName: "Office Managed Referrals", field: "officeManagedReferrals" },
  ];

  return (
    <>
        {/* {studentDisplay && studentData.length === 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: 300,
            left: 0,
            width: "100%",
          }}
          className="modal-overlay"
        >
          <div
            style={{
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
              maxHeight: "80rem",
              width: "80%",
              position: "relative",
              backgroundColor: "white", // Adjust background color as needed
              padding: "20px", // Adjust padding as needed
              borderRadius: "8px", // Add border radius as needed
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Add box shadow as needed
              overflowY: "hidden",
            }}
            className="modal-content"
          >
            <div className="modal-header">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  maxHeight: "20rem",
                }}
              >
                <div className="box-left">
                  <div className="student-info-box" style={{}}>
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
                  addSpotter();
                }}
              >
                Spot this Student
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
      )} */}

        <div
          style={{
            backgroundColor: "rgb(25, 118, 210)",
            marginTop: "10px",
            marginBlock: "5px",
          }}
        >
          {listOfStudents.length > 0 && (
            <div
              className="ag-theme-alpine"
              style={{ height: "60vh", width: "100%" }}
            >
              <AgGridReact
                rowData={listOfStudents} // Pass the processed list of students here
                columnDefs={columnDefs}
                domLayout="autoHeight"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherStudentPanel;
