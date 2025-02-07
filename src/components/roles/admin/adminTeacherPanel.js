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

import { get } from "../../../utils/api/api";
import { TeacherDetailsModal } from "./modals/teacher_profile_modal";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css"; // Using "alpine" for a modern theme

const AdminTeacherPanel = ({ data = [] }) => {
  const [teacherProfileModal, setTeacherProfileModal] = useState(false);
  const [teacherProfileData, setTeacherProfileData] = useState([]);
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [rowData, setRowData] = useState([
    {
      fullName: "Loading...",
      shoutOuts: 0,
      behaviorConcerns: 0,
      teacherManagedReferrals: 0,
      officeManagedReferrals: 0,
    },
  ]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Ensure that all data properties are safely handled (default to empty arrays)
  const teachers = data.teachers || [];
  const officeReferrals = data.officeReferrals || [];
  const shoutOutsResponse = data.shoutOutsResponse || [];
  const writeUpResponse = data.writeUpResponse || [];
  const punishmentResponse = data.punishmentResponse || [];

  // Process the data to map teachers with their referrals, shoutouts, and behavior concerns
  useEffect(() => {
    const processTeacherData = () => {
      const teacherDataMap = new Map();

      // Initialize teachers data in the map
      teachers.forEach((teacher) => {
        const fullName = `${teacher.firstName} ${teacher.lastName}`;
        teacherDataMap.set(teacher.email, {
          fullName,
          teacherManagedReferrals: 0,
          officeManagedReferrals: 0,
          shoutOuts: 0,
          behaviorConcerns: 0,
        });
      });

      // Update teacher-managed referrals
      punishmentResponse.forEach((writeUp) => {
        const email = writeUp.teacherEmail;
        if (
          teacherDataMap.has(email) &&
          writeUp.infractionName !== "Behavior Concern" &&
          writeUp.infractionName !== "Positive Behavior Shout Out!" &&
          writeUp.infractionName !== "Academic Concern"
        ) {
          teacherDataMap.get(email).teacherManagedReferrals += 1;
        }
      });

      // Update office-managed referrals
      officeReferrals.forEach((referral) => {
        const email = referral.teacherEmail;
        if (teacherDataMap.has(email)) {
          teacherDataMap.get(email).officeManagedReferrals += 1;
        }
      });

      // Update positive shoutouts
      punishmentResponse.forEach((writeUp) => {
        const email = writeUp.teacherEmail;
        if (
          teacherDataMap.has(email) &&
          writeUp.infractionName === "Positive Behavior Shout Out!"
        ) {
          teacherDataMap.get(email).shoutOuts += 1;
        }
      });

      // Update behavior concerns
      punishmentResponse.forEach((writeUp) => {
        const email = writeUp.teacherEmail;
        if (
          teacherDataMap.has(email) &&
          writeUp.infractionName === "Behavior Concern"
        ) {
          teacherDataMap.get(email).behaviorConcerns += 1;
        }
      });

      const formattedData = Array.from(teacherDataMap.values());
      console.log(" Formatted Data Map ", formattedData);
      setFilteredData(formattedData);
    };

    if (data.teachers.length > 0) {
      processTeacherData();
    }
  }, [data]);

  useEffect(() => {
    if (Array.isArray(filteredData) && filteredData.length > 0) {
      setRowData([...filteredData]); // Ensure it's an array
    }
  }, [filteredData]);

  const handleProfileClick = (x) => {
    setActiveTeacher(x);
    setTeacherProfileModal(true);
  };

  const autoSizeStrategy = {
    type: "fitCellContents",
  };

  const columnDefs = [
    { headerName: "Teacher Name", field: "fullName" },
    { headerName: "Positive Shout Outs", field: "shoutOuts" },
    { headerName: "Behavior Concerns", field: "behaviorConcerns" },
    {
      headerName: "Teacher Managed Referrals",
      field: "teacherManagedReferrals",
    },
    { headerName: "Office Managed Referrals", field: "officeManagedReferrals" },
  ];

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

  const theRows = {
    fullName: "Test Teacher",
    shoutOuts: 2,
    behaviorConcerns: 1,
    teacherManagedReferrals: 3,
    officeManagedReferrals: 4,
  };

  const hasScroll = data.length > 10;
  console.log("Filtered Data before setting rowData:", filteredData);
  console.log("Row Data:", rowData);

  return (
    <>
      {teacherProfileModal && activeTeacher && (
        <TeacherDetailsModal
          teacherProfileData={teacherProfileData}
          activeTeacher={activeTeacher}
          setDisplayBoolean={setTeacherProfileModal}
        />
      )}
      <div
        className="ag-theme-alpine"
        style={{ height: "400px", width: "100%" }}
      >
        <AgGridReact
          rowData={rowData.length > 0 ? rowData : []} // Ensures rowData is an array
          columnDefs={columnDefs}
          domLayout="autoHeight" // Ensures dynamic row height
          onRowClicked={(row) => handleProfileClick(row.data)}
        />
      </div>
    </>
  );
};
export default AdminTeacherPanel;
