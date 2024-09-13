import React from "react";
import { AdminOverviewDto, TeacherDto } from "src/types/responses";
import { Employee } from "src/types/school";
import ReactEcharts from "echarts-for-react";

export const IncidentByTeacherPieChart: React.FC<AdminOverviewDto> = ({
  writeUpResponse = [],
  teachers = [],
}) => {
  //grab total indcidents
  const totalIncidents = (writeUpResponse as TeacherDto[]).length;

  let uniqueTeachers: Record<string, number> = {};

  // Get Unique Teachers Info
  (writeUpResponse as TeacherDto[]).forEach((item) => {
    const teacherEmail = item.teacherEmail;
    uniqueTeachers[teacherEmail] = (uniqueTeachers[teacherEmail] || 0) + 1;
  });

  //Grab teachers and extract emails
  const teachersWithIncidentsList = Object.entries(uniqueTeachers).map(
    ([teacherEmail, incidents]) => {
      let teacher = (writeUpResponse as TeacherDto[]).find(
        (item) => item.teacherEmail === teacherEmail
      );

      let employee = (teachers as Employee[]).find(
        (teacher) => teacher.email === teacherEmail
      );
      const teacherFirstName = employee?.firstName || "Unknown";
      const teacherLastName = employee?.lastName || "Unknown";

      return {
        teacherEmail,
        teacherFirstName,
        teacherLastName,
        incidents: Number(incidents),
        percent: ((Number(incidents) / totalIncidents) * 100).toFixed(2),
      };
    }
  );

  const option = {
    title: {
      text: "Total Contacts by Teacher",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      align: "auto",
      left: "left",
      top: "10%",
    },
    series: [
      {
        type: "pie",
        radius: "80%",
        label: {
          show: false,
        },
        data: [
          ...teachersWithIncidentsList.map((teacher) => ({
            value: teacher.incidents,
            name: `${teacher.teacherFirstName} ${teacher.teacherLastName}`,
          })),
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
