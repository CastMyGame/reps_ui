import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css"; // Using "alpine" for a modern theme
import {
  currentWeek,
  extractDataByWeek,
} from "src/helperFunctions/helperFunctions";
import { Employee } from "src/types/school";
import { TeacherDto } from "src/types/responses";
import { ColDef, SizeColumnsToContentStrategy } from "ag-grid-community";

interface PeriodData {
  count: number;
  teacher: string;
}

interface WorseClassProps {
  punishmentResponse: TeacherDto[];
  teachers: Employee[];
}

export const WorseClassTable: React.FC<WorseClassProps> = ({
  punishmentResponse = [],
  teachers = [],
}) => {
  // Initialize structures to track write-ups and the corresponding teacher
  const writeUpsByPeriod: Record<string, PeriodData> = {};

  // Define periods dynamically
  const periods = [
    "period1",
    "period2",
    "period3",
    "period4",
    "period5",
    "period6",
    "period7",
    "period8",
    "period9",
  ];

  // Initialize each period with default values
  periods.forEach((period) => {
    writeUpsByPeriod[period] = { count: 0, teacher: "" };
  });

  teachers.forEach((teacher) => {
    const weekData = extractDataByWeek(currentWeek, punishmentResponse);
    const negWriteUpData = weekData.filter(
      (item) =>
        "infractionName" in item && item.infractionName !== "Positive Behavior Shout Out!" &&
        item.teacherEmail === teacher.email
    );

    periods.forEach((period) => {
      const count = negWriteUpData.filter((item) => item.classPeriod === period).length;
  
      // Update if this teacher has more write-ups
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

  const autoSizeStrategy: SizeColumnsToContentStrategy = {
    type: "fitCellContents",
  };

  // Define column definitions
  const columnDefs: ColDef[] = [
    { headerName: "Period", field: "period" },
    { headerName: "Number of Write-Ups", field: "count" },
    { headerName: "Teacher", field: "teacher" },
  ];

  return (
    <div style={{
      width: "100%",
      marginTop: "10px",
    }}>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Classes With Highest Write-Ups By Period
      </h3>
      <div className="ag-theme-alpine">
        <AgGridReact
          rowData={sortedPeriods}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          autoSizeStrategy={autoSizeStrategy}
        />
      </div>
    </div>
  );
};
