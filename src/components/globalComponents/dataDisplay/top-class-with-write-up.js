import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css"; // Using "alpine" for a modern theme
import { currentWeek, extractDataByWeek } from "src/helperFunctions/helperFunctions";

export const WorseClassTable = ({ punishmentResponse = [], teachers = [] }) => {
  // Initialize structures to track write-ups and the corresponding teacher
  const writeUpsByPeriod = {
    block1: { count: 0, teacher: "" },
    block2: { count: 0, teacher: "" },
    block3: { count: 0, teacher: "" },
    block4: { count: 0, teacher: "" },
  };

  teachers.forEach((teacher) => {
    const weekData = extractDataByWeek(currentWeek, punishmentResponse);
    const negWriteUpData = weekData.filter(
      (item) =>
        item.infractionName !== "Positive Behavior Shout Out!" &&
        item.teacherEmail === teacher.email
    );

    const periods = ["block1", "block2", "block3", "block4"];
    periods.forEach((period) => {
      const count = negWriteUpData.filter(
        (item) => item.classPeriod === period
      ).length;

      // Update the period data if this teacher has more write-ups
      if (count > writeUpsByPeriod[period].count) {
        writeUpsByPeriod[period] = {
          count,
          teacher: `${teacher.firstName} ${teacher.lastName}`,
        };
      }
    });
  });

  // Convert write-ups object to array and sort by highest write-ups
  const sortedPeriods = Object.entries(writeUpsByPeriod)
    .map(([period, { count, teacher }]) => ({ period, count, teacher }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

    const autoSizeStrategy = {
      type: 'fitCellContents'
  };

  // Define column definitions
  const columnDefs = [
    { headerName: "Period", field: "period" },
    { headerName: "Number of Write-Ups", field: "count" },
    { headerName: "Teacher", field: "teacher" },
  ];

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Classes With Highest Write-Ups By Period
      </h3>
      <div
        className="ag-theme-alpine"
        style={{ height: "25vh" }}
      >
        <AgGridReact
          rowData={sortedPeriods}
          columnDefs={columnDefs}
          domLayout="autoHeight" // Ensures that the height is handled properly
          autoSizeStrategy={autoSizeStrategy}
        />
      </div>
    </div>
  );
};
