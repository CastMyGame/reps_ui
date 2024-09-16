import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export const Top5TeacherRatioTable = ({ data = [], teacherData = [] }) => {
  const [mostPositiveRowData, setMostPositiveRowData] = useState([]);

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

    // Sort by posRatio in descending order and slice the top two teachers for "Most Positive"
    const topTwoTeachers = teachersWithIncidentsList
      .sort((a, b) => b.posRatio - a.posRatio)
      .slice(0, 2);

    // Set the rowData for both tables
    setMostPositiveRowData(topTwoTeachers);
  }, [data, teacherData]);

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
          columnDefs={colDefs}
          domLayout="autoHeight" // Ensures that the height is handled properly
        />
      </div>
    </div>
  );
};
