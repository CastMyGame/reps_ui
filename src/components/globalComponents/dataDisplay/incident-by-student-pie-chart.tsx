import React from "react";
import ReactEcharts from "echarts-for-react";
import "./CustomPieChart.css";
import { AdminOverviewDto, TeacherDto } from "src/types/responses";

export const IncidentByStudentPieChart: React.FC<AdminOverviewDto> = ({
  writeUpResponse = [],
}) => {
  console.log("write up response: ", writeUpResponse);
  // const filterData = data.filter()
  let uniqueStudents: Record<string, number> = {};
  const totalIncidents = (writeUpResponse as TeacherDto[]).length;

  // Get Unique Students Info
  (writeUpResponse as TeacherDto[]).forEach((item) => {
    const studentEmail = item.studentEmail;
    uniqueStudents[studentEmail] = (uniqueStudents[studentEmail] || 0) + 1;
  });

  const studentsWithIncidentsList = Object.entries(uniqueStudents).map(
    ([studentEmail, incidents]) => {
      let student = (writeUpResponse as TeacherDto[]).find(
        (item) => item.studentEmail === studentEmail
      );

      const studentFirstName = student?.studentFirstName || "Unknown";
      const studentLastName = student?.studentLastName || "Unknown";

      return {
        studentEmail,
        studentFirstName,
        studentLastName,
        incidents: Number(incidents),
        percent: ((Number(incidents) / totalIncidents) * 100).toFixed(2),
      };
    }
  );

  const meetsThreshold = studentsWithIncidentsList
    .filter((ind) => parseFloat(ind.percent) > 8.0)
    .sort((a, b) => b.incidents - a.incidents);
  const otherNotMeetingTreshold = studentsWithIncidentsList
    .filter((ind) => parseFloat(ind.percent) <= 5.0)
    .sort((a, b) => b.incidents - a.incidents);

  const option = {
    title: {
      text: "Highly Active Students",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        type: "pie",
        radius: "50%",
        data: [
          ...meetsThreshold.map((student) => ({
            value: student.incidents,
            name: `${student.studentFirstName} ${student.studentLastName}`,
          }))
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return (
    <div>
      <ReactEcharts option={option} />
    </div>
  );
};
