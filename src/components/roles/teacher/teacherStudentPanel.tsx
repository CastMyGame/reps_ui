import { useState, useEffect, useRef, useMemo } from "react";
import {
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  Card,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import "jspdf-autotable";
import { IncidentByTypePieChart } from "src/components/globalComponents/dataDisplay/incidentsByType";
import { get } from "../../../utils/api/api";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  AdminOverviewDto,
  TeacherOverviewDto,
  TeacherReferral,
} from "src/types/responses";
import { Student } from "src/types/school";
import { CellClickedEvent, ColDef } from "ag-grid-community";
import StudentReferralsByWeek from "src/components/globalComponents/dataDisplay/studentReferralsByBehavior";

interface StudentPanelProps {
  setPanelName: (panel: string) => void;
  data?: TeacherOverviewDto | AdminOverviewDto;
}

interface StudentDisplay {
  studentEmail: string;
  fullName?: string;
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
  const [selectedGrade, setSelectedGrade] = useState("");
  const [spotEmail, setSpotEmail] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState([]);
  const [trackedBehaviorTotals, setTrackedBehaviorTotals] = useState<
    Record<string, number>
  >({});
  const [trackedBehaviorTimeline, setTrackedBehaviorTimeline] = useState<any[]>(
    [],
  );
  const [trackedBehaviorLoading, setTrackedBehaviorLoading] = useState(false);
  const [selectedStudentTab, setSelectedStudentTab] = useState<
    | "all"
    | "trackedBehaviors"
    | "trackedBehaviorAdjustments"
    | "punishments"
    | "positiveShoutOuts"
    | "behavioralConcerns"
  >("all");

  const isAdmin = !!(data as AdminOverviewDto)?.teachers;

  const fetchAdminStudents = async (data: AdminOverviewDto, headers: any) => {
    const url = `${baseUrl}/student/v1/allStudents`;
    try {
      const response = await axios.get(url, { headers });

      const teacherManagedReferrals = data?.writeUpResponse ?? [];
      const officeManagedReferrals = data?.officeReferrals ?? [];

      const formattedStudents: StudentDisplay[] = response.data.map(
        (student: Student) => ({
          fullName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.studentEmail,
          grade: student.grade,
          teacherManagedReferrals: teacherManagedReferrals.filter(
            (w) => w.studentEmail === student.studentEmail,
          ).length,
          officeManagedReferrals: officeManagedReferrals.filter(
            (o) => o.studentEmail === student.studentEmail,
          ).length,
          className: "N/A",
        }),
      );

      return formattedStudents;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch students");
    }
  };

  const fetchTeacherStudents = async (
    data: TeacherOverviewDto,
    headers: any,
  ) => {
    try {
      const uniqueEmails = Array.from(
        new Set(
          data.teacher?.classes?.flatMap((classItem) => classItem.classRoster),
        ),
      );

      const url = `${baseUrl}/student/v1/getByEmailList`;
      const response = await axios.post(url, uniqueEmails, { headers });

      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to fetch students");
    }
  };

  const fetchTrackedBehaviorTotals = async (studentEmail: string) => {
    try {
      const response = await get(
        `tracked-behaviors/v1/student/${studentEmail}/totals`,
      );
      if (response != null) {
        setTrackedBehaviorTotals(response);
      } else {
        setTrackedBehaviorTotals({});
      }
    } catch (error) {
      console.error(error);
      setTrackedBehaviorTotals({});
    }
  };

  const fetchTrackedBehaviorTimeline = async (studentEmail: string) => {
    try {
      const response = await get(
        `tracked-behaviors/v1/student/${studentEmail}/timeline`,
      );
      if (response != null) {
        setTrackedBehaviorTimeline(response);
      } else {
        setTrackedBehaviorTimeline([]);
      }
    } catch (error) {
      console.error(error);
      setTrackedBehaviorTimeline([]);
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
            const fetchedStudents = await fetchAdminStudents(data, headers);
            setListOfStudents(fetchedStudents);
          } else {
            const fetchedStudents = await fetchTeacherStudents(data, headers);
            const studentsArray: StudentDisplay[] = [];
            data?.teacher?.classes?.forEach((classEntry) => {
              classEntry.classRoster.forEach((student) => {
                const foundStudent = fetchedStudents.find(
                  (s: Student) => s.studentEmail === student,
                );
                if (foundStudent) {
                  studentsArray.push({
                    fullName: `${foundStudent.firstName} ${foundStudent.lastName}`,
                    studentEmail: foundStudent.studentEmail,
                    grade: foundStudent.grade,
                    teacherManagedReferrals: (
                      data?.writeUpResponse ?? []
                    ).filter(
                      (w) => w.studentEmail === foundStudent.studentEmail,
                    ).length,
                    officeManagedReferrals: (
                      data?.officeReferrals ?? []
                    ).filter(
                      (o) => o.studentEmail === foundStudent.studentEmail,
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

  const fetchStudentData = async (studentEmail: string) => {
    try {
      setTrackedBehaviorLoading(true);
      setSelectedStudentTab("all");

      const response: TeacherReferral[] = await get(
        `punish/v1/student/punishments/${studentEmail}`,
      );

      if (response != null) {
        setStudentData(response);
        setStudentDisplay(true);
      } else {
        setStudentData([]);
        setStudentDisplay(true);
      }

      await Promise.all([
        fetchTrackedBehaviorTotals(studentEmail),
        fetchTrackedBehaviorTimeline(studentEmail),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setTrackedBehaviorLoading(false);
    }
  };

  const formatBehaviorLabel = (code: string) =>
    code
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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
            `You have been successfully added as a spotter for: ${spotEmail} `,
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

  const sortedStudentData = useMemo(() => {
    return [...studentData].sort((a, b) => {
      const aTime = a?.timeCreated ? new Date(a.timeCreated).getTime() : 0;
      const bTime = b?.timeCreated ? new Date(b.timeCreated).getTime() : 0;
      return bTime - aTime;
    });
  }, [studentData]);

  const positiveShoutOutsData = useMemo(() => {
    return sortedStudentData.filter(
      (student) => student.infractionName === "Positive Behavior Shout Out!",
    );
  }, [sortedStudentData]);

  const behavioralConcernsData = useMemo(() => {
    return sortedStudentData.filter(
      (student) => student.infractionName === "Behavioral Concern",
    );
  }, [sortedStudentData]);

  const punishmentsOnlyData = useMemo(() => {
    return sortedStudentData.filter(
      (student) =>
        student.infractionName !== "Positive Behavior Shout Out!" &&
        student.infractionName !== "Behavioral Concern",
    );
  }, [sortedStudentData]);

  const handleProfileClick = (x: CellClickedEvent) => {
    fetchStudentData(x.data.studentEmail);
    setSpotEmail(x.data.studentEmail);
    setSelectedStudentName(x.data.fullName);
  };

  const pdfRef = useRef();

  const hasScroll = listOfStudents.length > 10;

  const filteredStudentData = listOfStudents.filter(
    (student) => student.className === selectedClass,
  );

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

  useEffect(() => {
    const classes = data?.teacher?.classes ?? [];

    if (!isAdmin && selectedClass === "" && classes?.length > 0) {
      const firstClass = classes?.find((c) => c.className.trim() !== "");
      if (firstClass) {
        setSelectedClass(firstClass.className);
      }
    }
  }, [isAdmin, selectedClass, data]);

  return (
    <>
      {!isAdmin &&
      (!data?.teacher?.classes || data.teacher?.classes?.length === 0) ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2>No classes have been created yet.</h2>
          <p>Please create a class to view and manage students.</p>
        </div>
      ) : (
        <>
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
                  width: "90%",
                  maxWidth: "1200px",
                  height: "90vh",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <div className="modal-header">
                  <h1>Student has No punishments</h1>
                </div>
                <div
                  className="modal-buttons"
                  style={{
                    padding: "15px 10px 0 10px",
                    backgroundColor: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #ddd",
                    marginTop: "20px",
                    flexShrink: 0,
                  }}
                >
                  <button onClick={() => setStudentDisplay(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {studentDisplay && studentData && studentData.length > 0 && (
            <div
              className="modal-overlay"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1300,
                padding: "20px",
                boxSizing: "border-box",
              }}
            >
              <div
                className="modal-content"
                style={{
                  width: "90%",
                  maxWidth: "1200px",
                  height: "90vh",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    minHeight: 0,
                    paddingRight: "4px",
                  }}
                >
                  <div
                    className="modal-header"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "20px",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      className="box-left"
                      style={{ minWidth: "200px", flex: "1" }}
                    >
                      <AccountBoxIcon style={{ fontSize: "100px" }} />
                      <h4>{selectedStudentName}</h4>
                      <div className="details-box">
                        <p>Email: {filteredData[0]?.studentEmail}</p>
                        <p>Grade: {filteredData[0]?.grade || "N/A"}</p>
                        <p>Class: {filteredData[0]?.className || "N/A"}</p>
                      </div>
                    </div>
                    <Card
                      style={{ width: "100%", flex: "2", height: "100%" }}
                      variant="outlined"
                    >
                      <StudentReferralsByWeek data={studentData} />
                    </Card>
                    <div
                      className="box-right"
                      style={{ minWidth: "250px", flex: "1" }}
                    >
                      <IncidentByTypePieChart data={studentData} />
                    </div>
                  </div>

                  <div
                    className="modal-body-student"
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    <Card
                      style={{
                        width: "100%",
                        marginBottom: "20px",
                      }}
                      variant="outlined"
                    >
                      <Box
                        sx={{
                          borderBottom: 1,
                          borderColor: "divider",
                          backgroundColor: "white",
                        }}
                      >
                        <Tabs
                          value={selectedStudentTab}
                          onChange={(_, newValue) =>
                            setSelectedStudentTab(newValue)
                          }
                          variant="scrollable"
                          scrollButtons="auto"
                        >
                          <Tab label="All" value="all" />
                          <Tab
                            label="Tracked Behaviors"
                            value="trackedBehaviors"
                          />
                          <Tab
                            label="Tracked Behavior Adjustments"
                            value="trackedBehaviorAdjustments"
                          />
                          <Tab label="Punishments" value="punishments" />
                          <Tab
                            label="Positive Shout Outs"
                            value="positiveShoutOuts"
                          />
                          <Tab
                            label="Behavioral Concerns"
                            value="behavioralConcerns"
                          />
                        </Tabs>
                      </Box>

                      <Box sx={{ padding: "16px" }}>
                        {selectedStudentTab === "all" && (
                          <TableContainer
                            style={{ backgroundColor: "white", fontSize: "18" }}
                          >
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    sx={{
                                      fontSize: "1.5rem",
                                      textAlign: "center",
                                    }}
                                  >
                                    Infraction
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: "1.5rem",
                                      textAlign: "center",
                                    }}
                                  >
                                    Description
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: "1.5rem",
                                      textAlign: "center",
                                    }}
                                  >
                                    Date
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: "1.5rem",
                                      textAlign: "center",
                                    }}
                                  >
                                    Status
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {sortedStudentData.map((student, index) => (
                                  <TableRow
                                    key={index}
                                    style={{
                                      background:
                                        index % 2 === 0 ? "lightgrey" : "white",
                                    }}
                                  >
                                    <TableCell
                                      sx={{
                                        fontSize: "1.5rem",
                                        textAlign: "center",
                                      }}
                                    >
                                      {student.infractionName}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "1.5rem",
                                        textAlign: "center",
                                      }}
                                    >
                                      {student.infractionDescription}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "1.5rem",
                                        textAlign: "center",
                                      }}
                                    >
                                      {new Date(
                                        student.timeCreated,
                                      ).toLocaleDateString("en-US")}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "1.5rem",
                                        textAlign: "center",
                                      }}
                                    >
                                      {student.status}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}

                        {selectedStudentTab === "trackedBehaviors" && (
                          <>
                            <h3 style={{ marginTop: 0 }}>Tracked Behaviors</h3>

                            {trackedBehaviorLoading ? (
                              <p>Loading tracked behaviors...</p>
                            ) : Object.keys(trackedBehaviorTotals).length ===
                              0 ? (
                              <p>No tracked behavior totals found.</p>
                            ) : (
                              <TableContainer
                                style={{ backgroundColor: "white" }}
                              >
                                <Table stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Behavior
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Total
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {Object.entries(trackedBehaviorTotals).map(
                                      ([behaviorCode, total], index) => (
                                        <TableRow
                                          key={behaviorCode}
                                          style={{
                                            background:
                                              index % 2 === 0
                                                ? "lightgrey"
                                                : "white",
                                          }}
                                        >
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {formatBehaviorLabel(behaviorCode)}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {total}
                                          </TableCell>
                                        </TableRow>
                                      ),
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </>
                        )}

                        {selectedStudentTab ===
                          "trackedBehaviorAdjustments" && (
                          <>
                            <h3 style={{ marginTop: 0 }}>
                              Tracked Behavior Adjustments
                            </h3>

                            {trackedBehaviorLoading ? (
                              <p>Loading tracked behavior adjustments...</p>
                            ) : trackedBehaviorTimeline.length === 0 ? (
                              <p>No tracked behavior adjustments found.</p>
                            ) : (
                              <TableContainer
                                style={{ backgroundColor: "white" }}
                              >
                                <Table stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Date
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Behavior
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Adjustment
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Teacher
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Class Period
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {trackedBehaviorTimeline.map(
                                      (event, index) => (
                                        <TableRow
                                          key={
                                            event.trackedBehaviorEventId ??
                                            index
                                          }
                                          style={{
                                            background:
                                              index % 2 === 0
                                                ? "lightgrey"
                                                : "white",
                                          }}
                                        >
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {event.timeCreated
                                              ? new Date(
                                                  event.timeCreated,
                                                ).toLocaleString("en-US")
                                              : "N/A"}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {event.behaviorName ??
                                              formatBehaviorLabel(
                                                event.behaviorCode,
                                              )}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {event.adjustmentValue > 0
                                              ? `+${event.adjustmentValue}`
                                              : event.adjustmentValue}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {event.teacherEmail ?? "N/A"}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {event.classPeriod ?? "N/A"}
                                          </TableCell>
                                        </TableRow>
                                      ),
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </>
                        )}

                        {selectedStudentTab === "punishments" && (
                          <>
                            <h3 style={{ marginTop: 0 }}>Punishments</h3>

                            {punishmentsOnlyData.length === 0 ? (
                              <p>No punishments found.</p>
                            ) : (
                              <TableContainer
                                style={{
                                  backgroundColor: "white",
                                  fontSize: "18",
                                }}
                              >
                                <Table stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Infraction
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Description
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Date
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Status
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {punishmentsOnlyData.map(
                                      (student, index) => (
                                        <TableRow
                                          key={index}
                                          style={{
                                            background:
                                              index % 2 === 0
                                                ? "lightgrey"
                                                : "white",
                                          }}
                                        >
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {student.infractionName}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {student.infractionDescription}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {new Date(
                                              student.timeCreated,
                                            ).toLocaleDateString("en-US")}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {student.status}
                                          </TableCell>
                                        </TableRow>
                                      ),
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </>
                        )}

                        {selectedStudentTab === "positiveShoutOuts" && (
                          <>
                            <h3 style={{ marginTop: 0 }}>
                              Positive Shout Outs
                            </h3>

                            {positiveShoutOutsData.length === 0 ? (
                              <p>No positive shout outs found.</p>
                            ) : (
                              <TableContainer
                                style={{
                                  backgroundColor: "white",
                                  fontSize: "18",
                                }}
                              >
                                <Table stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Teacher
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Description
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Date
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {positiveShoutOutsData.map(
                                      (student, index) => (
                                        <TableRow
                                          key={index}
                                          style={{
                                            background:
                                              index % 2 === 0
                                                ? "lightgrey"
                                                : "white",
                                          }}
                                        >
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {student.teacherEmail}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {student.infractionDescription}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {new Date(
                                              student.timeCreated,
                                            ).toLocaleDateString("en-US")}
                                          </TableCell>
                                        </TableRow>
                                      ),
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </>
                        )}

                        {selectedStudentTab === "behavioralConcerns" && (
                          <>
                            <h3 style={{ marginTop: 0 }}>
                              Behavioral Concerns
                            </h3>

                            {behavioralConcernsData.length === 0 ? (
                              <p>No behavioral concerns found.</p>
                            ) : (
                              <TableContainer
                                style={{
                                  backgroundColor: "white",
                                  fontSize: "18",
                                }}
                              >
                                <Table stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Teacher
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Description
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontSize: "1.5rem",
                                          textAlign: "center",
                                        }}
                                      >
                                        Date
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {behavioralConcernsData.map(
                                      (student, index) => (
                                        <TableRow
                                          key={index}
                                          style={{
                                            background:
                                              index % 2 === 0
                                                ? "lightgrey"
                                                : "white",
                                          }}
                                        >
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {student.teacherEmail}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {student.infractionDescription}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontSize: "1.5rem",
                                              textAlign: "center",
                                            }}
                                          >
                                            {new Date(
                                              student.timeCreated,
                                            ).toLocaleDateString("en-US")}
                                          </TableCell>
                                        </TableRow>
                                      ),
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </>
                        )}
                      </Box>
                    </Card>
                  </div>
                </div>

                <div
                  className="modal-buttons"
                  style={{
                    padding: "15px 10px 0 10px",
                    backgroundColor: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #ddd",
                    marginTop: "20px",
                    flexShrink: 0,
                  }}
                >
                  <button onClick={() => setStudentDisplay(false)}>
                    Cancel
                  </button>
                  <button onClick={addSpotter}>Spot this Student</button>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <h3>{isAdmin ? "All Students" : selectedClass}</h3>

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
