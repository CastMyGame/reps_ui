import React from "react";
import { OfficeReferral, TeacherDto } from "src/types/responses";
import { Employee } from "src/types/school";
import ReactEcharts from "echarts-for-react";
import {
  extractDataByWeek,
  getCurrentWeekOfYear,
} from "src/helperFunctions/helperFunctions";

interface IncidentByTeacherPieProps {
  writeUpResponse: TeacherDto[];
  officeReferrals: OfficeReferral[];
  teachers: Employee[];
}

export const IncidentByTeacherPieChart: React.FC<IncidentByTeacherPieProps> = ({
  writeUpResponse = [],
  officeReferrals = [],
  teachers = [],
}) => {
  const currentWeek = getCurrentWeekOfYear();

  // Filter data for the current week
  const weeklyTmIncidents = extractDataByWeek(currentWeek, writeUpResponse);
  const weeklyOmIncidents = extractDataByWeek(currentWeek, officeReferrals);

  // Combine both arrays into one
  const combinedIncidents = [...weeklyTmIncidents, ...weeklyOmIncidents];

  // Get Unique Teachers Info by aggregating incidents by teacherEmail
  const teacherIncidentMap = combinedIncidents.reduce<Record<string, number>>((acc, item) => {
    const teacherEmail = item.teacherEmail;
    acc[teacherEmail] = (acc[teacherEmail] || 0) + 1;
    return acc;
  }, {});

  // Map over unique teacher emails and get the incidents and teacher details
  const teachersWithIncidentsList = Object.entries(teacherIncidentMap).map(
    ([teacherEmail, incidents]) => {

      // Find the teacher details from the teachers list (Employee)
      const employee = teachers.find(
        (teacher) => teacher.email === teacherEmail
      );
      const teacherFirstName = employee?.firstName ?? "Unknown";
      const teacherLastName = employee?.lastName ?? "Unknown";

      return {
        teacherEmail,
        teacherFirstName,
        teacherLastName,
        incidents: Number(incidents),
        percent: ((Number(incidents) / combinedIncidents.length) * 100).toFixed(2),
      };
    }
  );

  const option = {
    title: {
      text: "Total Referrals by Teacher",
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
        radius: "65%",
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
