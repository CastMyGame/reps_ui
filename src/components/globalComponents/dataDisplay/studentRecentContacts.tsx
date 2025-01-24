import React, { useEffect, useState } from "react";
import {
  StudentContactList,
  TeacherDto,
  TeacherOverviewDto,
} from "src/types/responses";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { dateCreateFormat } from "src/helperFunctions/helperFunctions";

const RecentContacts: React.FC<Partial<TeacherOverviewDto>> = ({
  punishmentResponse = [],
  officeReferrals = [],
  students = [],
}) => {
  const [filteredData, setFilteredData] = useState<StudentContactList[]>([]);

  useEffect(() => {
    // Ensure `students` is a valid array
    const safeStudents = Array.isArray(students) ? students : [];

    const allContacts = [
      ...(punishmentResponse as TeacherDto[]),
      ...(officeReferrals as TeacherDto[]),
    ].filter(Boolean); // Remove null/undefined

    const uniqueStudentEmails = new Set<string>();
    const recentContacts: StudentContactList[] = [];

    // Sort the data in descending order by `timeCreated` to display the most recent first
    const sortedData = allContacts
      .slice()
      .sort((a, b) => {
        const dateA = new Date(a.timeCreated || 0);
        const dateB = new Date(b.timeCreated || 0);
        return dateB.getTime() - dateA.getTime();
      });

    sortedData.forEach((record) => {
      const studentEmail = record.studentEmail || "Unknown";
      if (!uniqueStudentEmails.has(studentEmail)) {
        uniqueStudentEmails.add(studentEmail);
        recentContacts.push({
          studentEmail,
          studentName: `${record.studentFirstName || "Unknown"} ${
            record.studentLastName || ""
          }`.trim(),
          timeCreated: record.timeCreated
            ? dateCreateFormat(record.timeCreated)
            : "N/A",
          infractionName: record.infractionName || "",
          infractionDescription: Array.isArray(record.infractionDescription)
            ? record.infractionDescription.join(", ")
            : record.infractionDescription || "",
        });
      }
    });

    // Map over safeStudents to ensure no null error
    const allStudentsData = safeStudents.map((student) => {
      const contact = recentContacts.find(
        (contact) => contact.studentEmail === student.studentEmail
      );

      return (
        contact || {
          studentEmail: student.studentEmail || "Unknown",
          studentName: `${student.firstName || "Unknown"} ${
            student.lastName || ""
          }`.trim(),
          timeCreated: "N/A",
          infractionName: "",
          infractionDescription: "",
        }
      );
    });

    const sortedAllStudentsData = allStudentsData.sort((a, b) => {
      if (a.timeCreated === "N/A" && b.timeCreated !== "N/A") return 1;
      if (b.timeCreated === "N/A" && a.timeCreated !== "N/A") return -1;

      const dateA = new Date(a.timeCreated || 0);
      const dateB = new Date(b.timeCreated || 0);
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredData(sortedAllStudentsData);
  }, [punishmentResponse, students, officeReferrals]);

  // Column definitions for AgGrid
  const colDefs: ColDef[] = [
    {
      field: "studentName",
      headerName: "Name",
      flex: 1,
      resizable: true,
    },
    {
      field: "timeCreated",
      headerName: "Last Contacted",
      flex: 1,
      resizable: true,
    },
    {
      field: "infractionName",
      headerName: "Contact Reason",
      flex: 1,
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
          rowData={filteredData as StudentContactList[]}
          columnDefs={colDefs as ColDef<StudentContactList>[]}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};


export default RecentContacts;
