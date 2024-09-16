import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export const Bottom4PositiveTeacherTable = ({
  data = [],
  teacherData = [],
}) => {
  const [leastPositiveRowData, setLeastPositiveRowData] = useState([]);

  useEffect(() => {
    // Create a list of teachers with incidents
    const teachersWithIncidentsList = teacherData
      .map((teacher) => {
        const teacherIncidents = data.filter(
          (item) => item.teacherEmail === teacher.email
        );

        if (teacherIncidents.length > 0) {
          const totalIncidents = teacherIncidents.length;
          const posIncidents = teacherIncidents.filter(
            (item) => item.infractionName === "Positive Behavior Shout Out!"
          ).length;

          return {
            teacherName: `${teacher.firstName} ${teacher.lastName}`,
            posRatio: ((posIncidents / totalIncidents) * 100).toFixed(2),
          };
        }
        return null;
      })
      .filter(Boolean); // Remove any null values

    // Sort by posRatio in ascending order and slice the bottom four teachers for "Least Positive"
    const bottomFourTeachers = teachersWithIncidentsList
      .sort((a, b) => a.posRatio - b.posRatio)
      .slice(0, 4);

    // Set the rowData for both tables
    setLeastPositiveRowData(bottomFourTeachers);
  }, [data, teacherData]);

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
          columnDefs={colDefs}
          domLayout="autoHeight" // Ensures that the height is handled properly
        />
      </div>
    </div>
  );
};
