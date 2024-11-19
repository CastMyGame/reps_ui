import React, { useEffect, useState } from "react";
import {
  AdminOverviewDto,
  StudentContactList,
  TeacherDto,
  TeacherOverviewDto,
} from "src/types/responses";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { dateCreateFormat } from "src/helperFunctions/helperFunctions";

const RecentContacts: React.FC<TeacherOverviewDto> = ({
  punishmentResponse = [],
  officeReferrals = [],
  teacher,
  students = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<StudentContactList[]>([]);

  useEffect(() => {
    const allContacts = [
      ...(punishmentResponse as TeacherDto[]),
      ...(officeReferrals as TeacherDto[]),
    ];
    const uniqueStudentEmails = new Set<string>();
    const recentContacts: StudentContactList[] = [];

    // Sort the data in descending order by `timeCreated` to display the most recent first
    const sortedData = [...allContacts].toSorted((a, b) => {
      const dateA =
        a.timeCreated === "N/A" ? new Date(0) : new Date(a.timeCreated);
      const dateB =
        b.timeCreated === "N/A" ? new Date(0) : new Date(b.timeCreated);
      return dateA.getTime() - dateB.getTime();
    });

    sortedData.forEach((record) => {
      if (!uniqueStudentEmails.has(record.studentEmail)) {
        uniqueStudentEmails.add(record.studentEmail);
        recentContacts.push({
          studentEmail: record.studentEmail,
          studentName: `${record.studentFirstName} ${record.studentLastName}`,
          timeCreated: dateCreateFormat(record.timeCreated),
          infractionName: record.infractionName,
          infractionDescription: Array.isArray(record.infractionDescription)
            ? record.infractionDescription.join(", ")
            : record.infractionDescription,
        });
      }
    });

    // Ensure all students are displayed, even those without recent contacts
    const allStudentsData = students.map((student) => {
      const contact = recentContacts.find(
        (contact) => contact.studentEmail === student.studentEmail
      );

      return (
        contact || {
          studentEmail: student.studentEmail,
          studentName: `${student.firstName} ${student.lastName}`,
          timeCreated: "N/A",
          infractionName: "",
          infractionDescription: "",
        }
      );
    });

    // Sort `allStudentsData`
    const sortedAllStudentsData = allStudentsData.sort((a, b) => {
      // Handle "N/A" for `timeCreated` first
      if (a.timeCreated === "N/A" && b.timeCreated !== "N/A") return -1; // "N/A" at the top
      if (b.timeCreated === "N/A" && a.timeCreated !== "N/A") return 1; // "N/A" at the top

      // Sort by date (ascending: oldest date at the top)
      const dateA = new Date(a.timeCreated);
      const dateB = new Date(b.timeCreated);
      return dateA.getTime() - dateB.getTime(); // Ascending order
    });

    setFilteredData(sortedAllStudentsData);
  }, [punishmentResponse, students, officeReferrals]);

  // Column definitions for AgGrid
  const colDefs: ColDef[] = [
    {
      field: "studentName",
      headerName: "Name",
      flex: 1, // Allow flexible sizing
      resizable: true,
    },
    {
      field: "timeCreated",
      headerName: "Last Contacted",
      flex: 1, // Allow flexible sizing
      resizable: true,
    },
    {
      field: "infractionName",
      headerName: "Contact Reason",
      flex: 1, // Allow flexible sizing
      resizable: true,
    },
  ];

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Student Last Contacts
      </h3>
      <div
        className="ag-theme-quartz"
        style={{ height: "25vh", width: "100%" }}
      >
        <AgGridReact
          rowData={filteredData}
          columnDefs={colDefs as ColDef<StudentContactList>[]}
          domLayout="autoHeight" // Ensures that the height is handled properly
        />
      </div>
    </div>
  );
};

export default RecentContacts;
