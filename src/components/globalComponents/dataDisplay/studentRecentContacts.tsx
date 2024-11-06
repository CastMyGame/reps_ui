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
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<StudentContactList[]>([]);

  useEffect(() => {
    console.log(punishmentResponse);
    // Filter the data based on the search query
    const filteredRecords = (punishmentResponse as TeacherDto[]).filter(
      (record) => {
        const fullName =
          `${record.studentFirstName} ${record.studentLastName}`.toLowerCase();

        return (
          fullName.includes(searchQuery.toLowerCase()) ||
          record.infractionName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      }
    );

    // Sort the data in descending order by `timeCreated` to display the most recent first
    const sortedData = filteredRecords.sort((a, b) => {
      const dateA = new Date(a.timeCreated);
      const dateB = new Date(b.timeCreated);
      return dateB.getTime() - dateA.getTime(); // Descending order (most recent first)
    });

    const uniqueStudentEmails = new Set<string>();
    const recentContacts: StudentContactList[] = [];

    // Collect most recent contact for each student
    sortedData.forEach((record) => {
      if (!uniqueStudentEmails.has(record.studentEmail)) {
        uniqueStudentEmails.add(record.studentEmail);
        recentContacts.push({
          studentName: `${record.studentFirstName} ${record.studentLastName}`,
          timeCreated: dateCreateFormat(record.timeCreated),
          infractionName: record.infractionName,
          // Join the infractionDescription array into a single string
          infractionDescription: Array.isArray(record.infractionDescription)
            ? record.infractionDescription.join(", ") // Join with a comma and space
            : record.infractionDescription, // Fallback in case it's not an array
        });
      }
    });

    // Sort recentContacts to display farthest date in the past on top in the table
    recentContacts.sort((a, b) => {
      const dateA = new Date(a.timeCreated);
      const dateB = new Date(b.timeCreated);
      return dateA.getTime() - dateB.getTime(); // Ascending order (oldest to most recent)
    });

    setFilteredData(recentContacts);
  }, [punishmentResponse, searchQuery]);

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
    // {
    //   field: "infractionDescription",
    //   headerName: "Description",
    //   flex: 1, // Allow flexible sizing
    //   resizable: true,
    // },
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
          domLayout="autoHeight" // Ensures that the height is handled properly
        />
      </div>
    </div>
  );
};

export default RecentContacts;
