import { Typography } from "@mui/material";
import React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import "./CustomPieChart.css";
import {
  StudentPunishment,
  TeacherDto,
  TeacherOverviewDto,
} from "src/types/responses";

export const IncidentByStudentPieChart: React.FC<TeacherOverviewDto> = ({
  writeUpResponse = [],
}) => {
  // const filterData = data.filter()
  let uniqueStudents: string[] = [];
  const totalIncidents = writeUpResponse.length;

  // Get Unique Students Info
  writeUpResponse.forEach((item) => {
    const studentEmail = item.studentEmail;
    // uniqueStudents[studentEmail] = (uniqueStudents[studentEmail] || 0) + 1;
    if (!uniqueStudents.includes(studentEmail)) {
      uniqueStudents.push(studentEmail);
    }
  });

  const studentsWithIncidentsList = Object.entries(uniqueStudents).map(
    ([studentEmail, incidents]) => {
      let { studentFirstName, studentLastName } = writeUpResponse.find(
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

  const option = {
    title: {
      text: "Referral Breakdown",
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
          { value: behavioralConcernData, name: "Behavioral Concern" },
          { value: positiveData, name: "Positive Shout Out!" },
          { value: referralData, name: "Teacher Referrals" },
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
