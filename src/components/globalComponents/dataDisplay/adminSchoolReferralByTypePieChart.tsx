import React from "react";
import ReactEcharts from "echarts-for-react";
import "./CustomPieChart.css";
import { AdminOverviewDto, TeacherDto } from "src/types/responses";
import {
  extractDataByWeek,
  getCurrentWeekOfYear,
  findDataByWeekAndByPunishment,
} from "src/helperFunctions/helperFunctions";

export const AdminSchoolReferralByTypePieChart: React.FC<AdminOverviewDto> = ({
  punishmentResponse = [],
  writeUpResponse = [],
  shoutOutsResponse = [],
  officeReferrals = [],
}) => {
  const currentWeek = getCurrentWeekOfYear();

  const behavioralConcerns = findDataByWeekAndByPunishment(
    currentWeek,
    "Behavioral Concern",
    punishmentResponse as TeacherDto[]
  );
  const shoutOutWeek = extractDataByWeek(
    currentWeek,
    shoutOutsResponse as TeacherDto[]
  );
  const officeReferralWeek = extractDataByWeek(
    currentWeek,
    officeReferrals as TeacherDto[]
  );
  const teacherReferralWeek = extractDataByWeek(
    currentWeek,
    writeUpResponse as TeacherDto[]
  );

  const option = {
    responsive: true,
    maintainAspectRatio: false,
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
        stillShowZeroSum: false,
        left: "30%",
        label: {
          show: false,
        },
        radius: "70%",
        data: [
          {
            value: behavioralConcerns,
            name: "Behavioral Concern",
          },
          {
            value: shoutOutWeek.length,
            name: "Positive Behavior Shout Out!",
          },
          {
            value: officeReferralWeek.length,
            name: "Office Referrals",
          },
          {
            value: teacherReferralWeek.length,
            name: "Teacher Referrals",
          },
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
    <div style={{ maxHeight: "100%", maxWidth: "100%" }}>
      <ReactEcharts option={option} />
    </div>
  );
};
