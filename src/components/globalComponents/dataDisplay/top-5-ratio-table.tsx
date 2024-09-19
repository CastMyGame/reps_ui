import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  AdminOverviewDto,
  IncidentList,
  TeacherDto,
} from "src/types/responses";
import { Employee } from "src/types/school";
import { ColDef } from "ag-grid-community";

export const Top5TeacherRatioTable: React.FC<AdminOverviewDto> = ({
  punishmentResponse = [],
  teachers = [],
}) => {
  const [mostPositiveRowData, setMostPositiveRowData] = useState<
    IncidentList[]
  >([]);

  useEffect(() => {
    // Create a list of teachers with incidents
    const teachersWithIncidentsList = (teachers as Employee[])
      .map((teacher: Employee) => {
        const teacherIncidents = (punishmentResponse as TeacherDto[]).filter(
          (item: TeacherDto) => item.teacherEmail === teacher.email
        );

        if (teacherIncidents.length > 0) {
          const totalIncidents = teacherIncidents.length;
          const posIncidents = teacherIncidents.filter(
            (item) => item.infractionName === "Positive Behavior Shout Out!"
          ).length;

          // Avoid division by zero and ensure posRatio is a number
          const posRatio =
            totalIncidents > 0
              ? Number(((posIncidents / totalIncidents) * 100).toFixed(2))
              : 0;

          return {
            teacherName: `${teacher.firstName} ${teacher.lastName}`,
            posRatio,
          };
        }
        return null;
      })
      .filter(Boolean); // Remove any null values

    // Sort by posRatio in descending order and slice the top two teachers for "Most Positive"
    const topTwoTeachers = (teachersWithIncidentsList as IncidentList[])
      .sort((a: IncidentList, b: IncidentList) => b.posRatio - a.posRatio)
      .slice(0, 2);

    // Set the rowData for both tables
    setMostPositiveRowData(topTwoTeachers);
  }, [punishmentResponse, teachers]);

  const colDefs = [
    { field: "teacherName", headerName: "Teacher Name" },
    { field: "posRatio", headerName: "Positive Ratio (%)" },
  ];

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Most Positive
      </h3>
      <div
        className="ag-theme-quartz"
        style={{ height: "25vh", width: "100%", marginBottom: "20px" }}
      >
        <AgGridReact
          rowData={mostPositiveRowData}
          columnDefs={colDefs as ColDef[]}
          domLayout="autoHeight" // Ensures that the height is handled properly
        />
      </div>
    </div>
  );
};
