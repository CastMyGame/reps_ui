import { useState, useEffect } from "react";
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
import jsPDF from "jspdf";
import "jspdf-autotable";

import { IncidentByStudentPieChart } from "src/components/globalComponents/dataDisplay/incident-by-student-pie-chart";
import IncidentsByStudentTable from "src/components/globalComponents/dataDisplay/incidentsByStudentTable";
import { get } from "../../utils/api/api";
import { TeacherDetailsModal } from "./modals/teacher_profile_modal";

const AdminTeacherPanel = () => {
  const [data, setData] = useState([]);
  const [teacherProfileModal, setTeacherProfileModal] = useState(false);
  const [teacherProfileData, setTeacherProfileData] = useState([]);
  const [activeTeacher, setActiveTeacher] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const result = await get("employees/v1/employees/TEACHER");
        setData(result);
      } catch (err) {
        console.error("Error Fetching Data: ", err);
      }
    };

    fetchEmployeeData();
  }, []);


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    // Filter the data based on the search query
    const filteredRecords = data.filter((employee) => {
      const fullName =
        `${employee.firstName} ${employee.lastName}`.toLowerCase();

      return fullName.includes(searchQuery.toLowerCase());
    });
    setFilteredData(filteredRecords);
  }, [data, searchQuery]);

  const handleProfileClick = (x) => {
    
    setActiveTeacher(x);
    setTeacherProfileModal(true);
  };

  // const pdfRef = useRef();

  // const generatePDF = (activeTeacher, studentData) => {
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
  //   pdf.text(`${activeTeacher.firstName} ${activeTeacher.lastName}`, 20, 20);
  //   pdf.text(`Email: ${activeTeacher.email}`, 20, 30);
  //   // pdf.text(`Phone: ${studentData[0].student.studentPhoneNumber}`, 20, 40);
  //   // pdf.text(`Grade: ${studentData[0].student.grade}`, 20, 50);
  //   // pdf.text(`Address: ${studentData[0].student.address}`, 20, 60);

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
  //   pdf.save("teacher_report.pdf");
  // };

  const hasScroll = data.length > 10;
  return (
    <>
     
     {teacherProfileModal && teacherProfileData &&(<TeacherDetailsModal teacherProfileData={teacherProfileData} activeTeacher={activeTeacher} setDisplayBoolean={setTeacherProfileModal}/>) }
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
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Teachers
        </Typography>
      </div>

      <TableContainer
        component={Paper}
        style={{
          maxHeight: hasScroll ? "720px" : "auto",
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
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Name
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Role
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((x, key) => (
                <TableRow
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
                      <span>
                        {x.firstName} {x.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{x.email}</TableCell>
                  <TableCell>{String(x.roles.map((x) => x.role))}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5">No open Data found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AdminTeacherPanel;
