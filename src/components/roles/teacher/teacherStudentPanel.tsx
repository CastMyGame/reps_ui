import { useState, useEffect, useRef, useMemo } from "react";
import {
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
} from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import "jspdf-autotable";
import { IncidentByTypePieChart } from "src/components/globalComponents/dataDisplay/incidentsByType";
import { get } from "../../../utils/api/api";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css"; // Using "alpine" for a modern theme
import {
  AdminOverviewDto,
  TeacherOverviewDto,
  TeacherReferral,
} from "src/types/responses";
import { Student } from "src/types/school";
import { CellClickedEvent, ColDef } from "ag-grid-community";

interface StudentPanelProps {
  setPanelName: (panel: string) => void;
  data?: TeacherOverviewDto | AdminOverviewDto;
}

interface StudentDisplay {
  studentEmail: string;
  fullName?: string; // ✅ Add fullName to avoid TypeScript errors
  grade: number;
  teacherManagedReferrals: number;
  officeManagedReferrals: number;
  className: string;
}

const TeacherStudentPanel: React.FC<StudentPanelProps> = ({
  setPanelName,
  data,
}) => {
  const [listOfStudents, setListOfStudents] = useState<StudentDisplay[]>([]);
  const [studentDisplay, setStudentDisplay] = useState(false);
  const [studentData, setStudentData] = useState<TeacherReferral[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState(""); // State for selected grade
  const [spotEmail, setSpotEmail] = useState("");
  const [selectedClass, setSelectedClass] = useState(""); // Selected class name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState([]);

  const isAdmin = !!(data as AdminOverviewDto)?.teachers; // If 'teachers' exists, it's an admin

  const fetchAdminStudents = async (data: AdminOverviewDto, headers: any) => {
    const url = `${baseUrl}/student/v1/allStudents`;
    try {
      const response = await axios.get(url, { headers });

      // Extract referrals from the admin data
      const teacherManagedReferrals = data?.writeUpResponse ?? [];
      const officeManagedReferrals = data?.officeReferrals ?? [];

      // Transform data to match StudentDisplay type
      const formattedStudents: StudentDisplay[] = response.data.map(
        (student: Student) => ({
          fullName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.studentEmail,
          grade: student.grade,
          teacherManagedReferrals: teacherManagedReferrals.filter(
            (w) => w.studentEmail === student.studentEmail
          ).length,
          officeManagedReferrals: officeManagedReferrals.filter(
            (o) => o.studentEmail === student.studentEmail
          ).length,
          className: "N/A", // Admin doesn't have class-specific data
        })
      );

      return formattedStudents;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch students");
    }
  };

  // Helper function to fetch students for teacher
  const fetchTeacherStudents = async (
    data: TeacherOverviewDto,
    headers: any
  ) => {
    try {
      const uniqueEmails = Array.from(
        new Set(
          data.teacher?.classes?.flatMap((classItem) => classItem.classRoster)
        )
      );

      const url = `${baseUrl}/student/v1/getByEmailList`;
      const response = await axios.post(url, uniqueEmails, { headers });

      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to fetch students");
    }
  };

  useEffect(() => {
    setLoading(true);
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
    };

    const fetchStudents = async () => {
      try {
        if (data) {
          if ("teachers" in data) {
            // Admin fetching all students
            const fetchedStudents = await fetchAdminStudents(data, headers);
          } else {
            // Teacher fetching students from their class roster
            const fetchedStudents = await fetchTeacherStudents(
              data,
              headers
            );
            const studentsArray: StudentDisplay[] = [];
            data?.teacher?.classes?.forEach((classEntry) => {
              classEntry.classRoster.forEach((student) => {
                const foundStudent = fetchedStudents.find(
                  (s: Student) => s.studentEmail === student
                );
                if (foundStudent) {
                  studentsArray.push({
                    fullName: `${foundStudent.firstName} ${foundStudent.lastName}`,
                    studentEmail: foundStudent.studentEmail,
                    grade: foundStudent.grade,
                    teacherManagedReferrals: (
                      data?.writeUpResponse ?? []
                    ).filter(
                      (w) => w.studentEmail === foundStudent.studentEmail
                    ).length,
                    officeManagedReferrals: (
                      data?.officeReferrals ?? []
                    ).filter(
                      (o) => o.studentEmail === foundStudent.studentEmail
                    ).length,
                    className: classEntry.className,
                  });
                }
              });
            });
            setListOfStudents(studentsArray);
          }
        }
      } catch (error) {
        console.error(error);

        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Failed to fetch students");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [data]);

  useEffect(() => {
    if (
      data?.teacher?.classes &&
      data?.teacher.classes.length > 0 &&
      !selectedClass
    ) {
      setSelectedClass(data.teacher.classes[0].className);
    }
  }, [data?.teacher?.classes, selectedClass]);

  // Fetch specific student data when clicking the student name
  const fetchStudentData = async (studentEmail: string) => {
    try {
      const response: TeacherReferral[] = await get(
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

  const filteredData = useMemo(() => {
    return listOfStudents.filter((student) => {
      const matchesQuery =
        student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false;
      const matchesGrade =
        selectedGrade === "" || String(student.grade) === selectedGrade;
      return matchesQuery && matchesGrade;
    });
  }, [listOfStudents, searchQuery, selectedGrade]);

  const handleProfileClick = (x: CellClickedEvent) => {
    fetchStudentData(x.data.studentEmail);
    setSpotEmail(x.data.studentEmail);
    setStudent(x.data.fullName);
  };

  const pdfRef = useRef();

  // const generatePDF = (studentData: TeacherReferral[]) => {
  //   const pdf = new jsPDF();
  //   // Add logo
  //   const logoWidth = 50; // Adjust the width of the logo as needed
  //   const logoHeight = 50; // Adjust the height of the logo as needed
  //   const logoX = 130; // Adjust the X coordinate of the logo as needed
  //   const logoY = 15; // Adjust the Y coordinate of the logo as needed

  //   //https://medium.com/dont-leave-me-out-in-the-code/5-steps-to-create-a-pdf-in-react-using-jspdf-1af182b56cee
  //   //Resource for adding image and how pdf text works
  //   let image = new Image();
  //   image.src = "/burke-logo.png";
  //   pdf.addImage(image, "PNG", logoX, logoY, logoWidth, logoHeight);

  //   // Add student details section
  //   pdf.setFontSize(12);
  //   pdf.rect(15, 15, 180, 50);
  //   pdf.text(`${studentData[0].firstName} ${studentData[0].lastName}`, 20, 20);
  //   pdf.text(`Email: ${studentData[0].studentEmail}`, 20, 30);
  //   pdf.text(`Phone: ${studentData[0].studentPhoneNumber}`, 20, 40);
  //   pdf.text(`Grade: ${studentData[0].grade}`, 20, 50);

  //   // Add punishment details table
  //   (pdf as any).autoTable({
  //     startY: 70, // Adjust the Y-coordinate as needed
  //     head: [["Status", "Description", "Date", "Infraction"]],
  //     body: studentData.map((student) => [
  //       student.status,
  //       student.infractionDescription,
  //       student.timeCreated,
  //       student.infractionName,
  //     ]),
  //   });

  //   // Save or open the PDF
  //   pdf.save("student_report.pdf");
  // };

  const hasScroll = listOfStudents.length > 10;

  // Process and format the list of students and referral data
  useEffect(() => {
    console.log("Fetching students...");
    setLoading(true);
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
    };

    const fetchStudents = async () => {
      try {
        if (data) {
          let fetchedStudents: StudentDisplay[] = [];
          if ("teachers" in data) {
            fetchedStudents = await fetchAdminStudents(data, headers);
          } else {
            fetchedStudents = await fetchTeacherStudents(
              data as TeacherOverviewDto,
              headers
            );
          }
          console.log("Fetched students:", fetchedStudents);
          setListOfStudents(fetchedStudents);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [data]);

  const filteredStudentData = listOfStudents.filter(
    (student) => student.className === selectedClass
  );

  // const handleSearchChange = (e) => {
  //   setSearchQuery(e.target.value);
  // };

  // const handleGradeChange = (e) => {
  //   setSelectedGrade(e.target.value);
  // };

  // Define column definitions, with clickable student name
  const columnDefs = [
    {
      headerName: "Student Name",
      field: "fullName",
      onCellClicked: (params: CellClickedEvent) => {
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
      {/* If no classes exist and not an admin */}
      {!isAdmin &&
      (!data?.teacher?.classes || data.teacher?.classes?.length === 0) ? (
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
                  {/* <button
                    onClick={() => generatePDF(studentData)}
                    style={{ backgroundColor: "#CF9FFF" }}
                  >
                    Print
                  </button> */}
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
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  overflowY: "scroll",
                }}
              >
                <div
                  className="modal-header"
                  style={{ display: "flex", flexDirection: "row" }}
                >
                  <div className="box-left">
                    <AccountBoxIcon style={{ fontSize: "100px" }} />
                    <h4>{student}</h4>
                    <div className="details-box">
                      <p>Email: {filteredData[0]?.studentEmail}</p>
                      <p>Grade: {filteredData[0]?.grade || "N/A"}</p>
                      <p>Class: {filteredData[0]?.className || "N/A"}</p>
                    </div>
                  </div>
                  <div
                    className="box-right"
                    style={{ marginLeft: "auto", color: "white" }}
                  >
                    <IncidentByTypePieChart data={studentData} />
                  </div>
                </div>
                <div
                  className="modal-body-student"
                  style={{ flexGrow: 1, overflowY: "auto", maxHeight: "50vh" }}
                >
                  <TableContainer
                    style={{ backgroundColor: "white", fontSize: "18" }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ fontSize: "1.5rem", textAlign: "center" }}
                          >
                            Status
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: "1.5rem", textAlign: "center" }}
                          >
                            Description
                          </TableCell>
                          {/* <TableCell>Date</TableCell> */}
                          <TableCell
                            sx={{ fontSize: "1.5rem", textAlign: "center" }}
                          >
                            Infraction
                          </TableCell>
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
                            <TableCell
                              sx={{ fontSize: "1.5rem", textAlign: "center" }}
                            >
                              {student.status}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: "1.5rem", textAlign: "center" }}
                            >
                              {student.infractionDescription}
                            </TableCell>
                            {/* <TableCell> {student.timeCreated}</TableCell> */}
                            <TableCell
                              sx={{ fontSize: "1.5rem", textAlign: "center" }}
                            >
                              {student.infractionName}
                            </TableCell>
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
                  {/* <button
                    onClick={() => generatePDF(studentData)}
                    style={{ backgroundColor: "#CF9FFF" }}
                  >
                    Print
                  </button> */}
                </div>
              </div>
            </div>
          )}
          {/* Display Students Table */}
          <div style={{ marginTop: "20px" }}>
            <h3>{isAdmin ? "All Students" : selectedClass}</h3>

            {/* Show class selection only for teachers */}
            {!isAdmin && (
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
                  {data?.teacher?.classes
                    ?.filter((classEntry) => classEntry.className.trim() !== "")
                    .map((classEntry, index) => (
                      <option key={index} value={classEntry.className}>
                        {classEntry.className}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="ag-theme-alpine" style={{ width: "100%" }}>
              <AgGridReact
                rowData={isAdmin ? listOfStudents : filteredStudentData}
                columnDefs={columnDefs as ColDef[]}
                domLayout="autoHeight"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TeacherStudentPanel;
