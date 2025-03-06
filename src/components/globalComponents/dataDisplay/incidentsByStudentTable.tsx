import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import {
  AdminOverviewDto,
  OfficeReferral,
  StudentIncidentList,
  TeacherDto,
} from "src/types/responses";
import {
  currentWeek,
  extractDataByWeek,
} from "src/helperFunctions/helperFunctions";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Student } from "src/types/school";

interface IncidentsByStudentTableProps {
  writeUpResponse: TeacherDto[];
  officeReferrals: TeacherDto[];
  students: Student[];
}

const IncidentsByStudentTable: React.FC<IncidentsByStudentTableProps> = ({
  writeUpResponse = [],
  officeReferrals = [],
  students = [],
}) => {
  const [studentIncidentRowData, setStudentIncidentRowData] = useState<
    StudentIncidentList[]
  >([]);

  // Handle null or undefined writeUpResponse and officeReferrals
  const weekTmData = writeUpResponse
    ? extractDataByWeek(currentWeek, writeUpResponse as TeacherDto[])
    : [];
  const weekOmData = officeReferrals
    ? extractDataByWeek(currentWeek, officeReferrals as TeacherDto[])
    : [];

  useEffect(() => {
    // Combine weekTmData and weekOmData into one array
    const combinedWeekData = [...weekTmData, ...weekOmData];

    // Create an object to store aggregated incidents for each student
    const studentIncidentMap: Record<string, StudentIncidentList> = {};

    // Loop through combinedWeekData to accumulate incident counts per student
    combinedWeekData.forEach((incident: TeacherDto) => {
      const studentEmail = incident.studentEmail || "Unknown";
      const studentFirstName = incident.studentFirstName || "Unknown";
      const studentLastName = incident.studentLastName || "";

      // If the student doesn't exist in the map, add them
      if (!studentIncidentMap[studentEmail]) {
        studentIncidentMap[studentEmail] = {
          studentName: `${studentFirstName} ${studentLastName}`.trim(),
          totalIncidents: 0,
        };
      }

      // Increment the total incidents count
      studentIncidentMap[studentEmail].totalIncidents += 1;
    });

    // Ensure all students from the `students` prop are included
    students?.forEach((student) => {
      const studentEmail = student.studentEmail || "Unknown";
      const studentName = `${student.firstName || "Unknown"} ${
        student.lastName || ""
      }`.trim();

      if (!studentIncidentMap[studentEmail]) {
        // Add students with zero incidents
        studentIncidentMap[studentEmail] = {
          studentName,
          totalIncidents: 0,
        };
      }
    });

    // Convert the object to an array and sort by total incidents in descending order
    const sortedStudentsByIncidents = Object.values(studentIncidentMap).sort(
      (a, b) => b.totalIncidents - a.totalIncidents
    );

    // Set the rowData for the table
    setStudentIncidentRowData(sortedStudentsByIncidents);
  }, [writeUpResponse, officeReferrals, students]);

  // Column definitions for AgGrid
  const colDefs: ColDef[] = [
    {
      field: "studentName",
      headerName: "Student Name",
      flex: 1, // Allow flexible sizing
      resizable: true,
    },
    {
      field: "totalIncidents",
      headerName: "Total Referrals",
      flex: 1, // Allow flexible sizing
      resizable: true,
    },
  ];

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Referrals by Student
      </h3>
      <div
        className="ag-theme-quartz"
        style={{ height: "25vh", width: "100%" }}
      >
        <AgGridReact
          rowData={studentIncidentRowData as StudentIncidentList[]}
          columnDefs={colDefs as ColDef<StudentIncidentList>[]}
          domLayout="autoHeight" // Ensures that the height is handled properly
        />
      </div>
    </div>
  );
};

export default IncidentsByStudentTable;
