import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  AdminOverviewDto,
  TeacherDto,
  IncidentList,
} from "src/types/responses";
import { Employee } from "src/types/school";
import { ColDef } from "ag-grid-community";

export const Bottom4PositiveTeacherTable: React.FC<AdminOverviewDto> = ({
  punishmentResponse = [],
  teachers = [],
}) => {
  const [leastPositiveRowData, setLeastPositiveRowData] = useState<
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

    // Sort by posRatio in ascending order and slice the bottom four teachers for "Least Positive"
    const bottomFourTeachers = (teachersWithIncidentsList as IncidentList[])
      .sort((a: IncidentList, b: IncidentList) => a.posRatio - b.posRatio)
      .slice(0, 4);

    // Set the rowData for both tables
    setLeastPositiveRowData(bottomFourTeachers);
  }, [punishmentResponse, teachers]);

  const colDefs = [
    { field: "teacherName", headerName: "Teacher Name" },
    { field: "posRatio", headerName: "Positive Ratio (%)" },
  ];

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Least Positive
      </h3>
      <div
        className="ag-theme-quartz"
        style={{ height: "25vh", width: "100%" }}
      >
        <AgGridReact
          rowData={leastPositiveRowData}
          columnDefs={colDefs as ColDef<IncidentList>[]}
          domLayout="autoHeight" // Ensures that the height is handled properly
        />
      </div>
    </div>
  );
};
