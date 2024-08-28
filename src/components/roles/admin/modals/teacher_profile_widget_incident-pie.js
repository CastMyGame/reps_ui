import { Typography } from "@mui/material";
import React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";

export const TeacherProfileIncidentByStudentPieChart = ({ writeUps = [] }) => {
  // const filterData = data.filter()
  const uniqueStudents = {};
  const totalIncidents = writeUps.length;

  // Get Unique Students Info
  writeUps.forEach((item) => {
    const studentEmail = item.studentEmail;
    uniqueStudents[studentEmail] = (uniqueStudents[studentEmail] || 0) + 1;
  });

  const studentsWithIncidentsList = Object.entries(uniqueStudents).map(
    ([studentEmail, incidents]) => {
      const { studentFirstName, studentLastName } = writeUps.find(
        (item) => item.studentEmail === studentEmail
      );

      return {
        studentEmail,
        studentFirstName,
        studentLastName,
        incidents,
        percent: ((incidents / totalIncidents) * 100).toFixed(2),
      };
    }
  );

  const meetsTres = studentsWithIncidentsList
    .filter((ind) => parseFloat(ind.percent) > 5.0)
    .sort((a, b) => b.incidents - a.incidents);
  const otherNotMeetingTreshold = studentsWithIncidentsList
    .filter((ind) => parseFloat(ind.percent) <= 5.0)
    .sort((a, b) => b.incidents - a.incidents);

  const modifiedList = [
    ...meetsTres,
    {
      studentId: "001",
      studentFirstName: "Other",
      studentLastName: "Students",
      incidents: otherNotMeetingTreshold
        .reduce((acc, student) => {
          return acc + student.incidents;
        }, 0)
        .toFixed(2),
      percent: otherNotMeetingTreshold
        .reduce((acc, student) => {
          return acc + parseFloat(student.percent);
        }, 0)
        .toFixed(2), // Closing parenthesis was added here
    },
  ];

  // Custom styles for the scrollable container
  const scrollableContainerStyle = {
    maxHeight: "200px",
    overflowY: "auto",
    paddingRight: "10px", // Adjust as needed to make room for the scrollbar
  };

  const generateLegendColor = (index) => {
    const colors = [
      "#02B2AF",
      "#2E96FF",
      "#B800D8",
      "#60009B",
      "#2731C8",
      "#03008D",
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection:'column' }}>
        <h2 style={{textAlign:"center"}}>Pie Chart - Incident</h2>
        <PieChart
          series={[
            {
              data: modifiedList.map((student, index) => ({
                id: index,
                value: parseFloat(student.percent),
                label: ` ${student.studentEmail}`,
              })),
              arcLabel: (item) => `(${parseFloat(item.value)}%)`,
              arcLabelMinAngle: 45,
            },
          ]}
          width={300}
          height={300}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: "white",
              fontWeight: "bold",
            },
          }}
          slotProps={{ legend: { hidden: true } }}
   
        />
        {/* <div className="legend">
          {modifiedList.map((student, index) => (
            <div key={index} className="legend-item">
              <div
                className={`legend-color legend-color-${index + 1}`}
                style={{ backgroundColor: generateLegendColor(index) }}
              ></div>
              <span>{`${student.studentEmail} `}</span>
            </div>
          ))}
        </div> */}
      </div>
    </>
  );
};