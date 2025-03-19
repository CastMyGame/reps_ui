import { useState, useEffect } from "react";
import "jspdf-autotable";
import { TeacherDetailsModal } from "./modals/teacher_profile_modal";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css"; // Using "alpine" for a modern theme
import { AdminOverviewDto } from "src/types/responses";
import { Employee } from "src/types/school";
import { TeacherData } from "src/types/menus";

interface AdminTeacherProps {
  adminDto: AdminOverviewDto;
}

const AdminTeacherPanel: React.FC<AdminTeacherProps> = ({ adminDto }) => {
  const [teacherProfileModal, setTeacherProfileModal] = useState(false);
  const [teachersList, setTeachersList] = useState<Employee[]>([]);
  const [activeTeacher, setActiveTeacher] = useState<TeacherData>();
  const [filteredData, setFilteredData] = useState<TeacherData[]>([]);
  const [rowData, setRowData] = useState([
    {
      fullName: "Loading...",
      shoutOuts: 0,
      behaviorConcerns: 0,
      teacherManagedReferrals: 0,
      officeManagedReferrals: 0,
    },
  ]);

  // const [searchQuery, setSearchQuery] = useState("");
  // const handleSearchChange = (e) => {
  //   setSearchQuery(e.target.value);
  // };

  useEffect(() => {
    setTeachersList(adminDto?.teachers);
  }, [adminDto.teachers]);

  // Process the data to map teachers with their referrals, shoutouts, and behavior concerns
  useEffect(() => {
    const teachers = adminDto.teachers || [];
    const officeReferrals = adminDto.officeReferrals || [];
    const punishmentResponse = adminDto.punishmentResponse || [];
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
      setFilteredData(formattedData);
    };

    if (adminDto.teachers.length > 0) {
      processTeacherData();
    }
  }, [adminDto]);

  useEffect(() => {
    if (Array.isArray(filteredData) && filteredData.length > 0) {
      setRowData([...filteredData]); // Ensure it's an array
    }
  }, [filteredData]);

  const handleProfileClick = (x) => {
    setActiveTeacher(x);
    setTeacherProfileModal(true);
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

  return (
    <>
      {teacherProfileModal && activeTeacher && (
        <TeacherDetailsModal
          activeTeacher={activeTeacher}
          setDisplayBoolean={setTeacherProfileModal}
          adminDto={adminDto}
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
