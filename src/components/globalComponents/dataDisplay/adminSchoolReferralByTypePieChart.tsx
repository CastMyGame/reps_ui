import React from "react";
import ReactEcharts from "echarts-for-react";
import "./CustomPieChart.css";
import { OfficeReferral, TeacherDto } from "src/types/responses";
import {
  extractDataByWeek,
  getCurrentWeekOfYear,
  GenerateBxByWeek
} from "src/helperFunctions/helperFunctions";

interface AdminReferralByTypeProps {
  punishmentResponse: TeacherDto[];
  writeUpResponse: TeacherDto[];
  shoutOutsResponse: TeacherDto[];
  officeReferrals: OfficeReferral[];
}

export const AdminSchoolReferralByTypePieChart: React.FC<AdminReferralByTypeProps> = ({
  punishmentResponse,
  writeUpResponse,
  shoutOutsResponse,
  officeReferrals,
}) => {
  const currentWeek = getCurrentWeekOfYear();

  const behavioralConcerns = GenerateBxByWeek(
    "Behavioral Concern",
    currentWeek,
    writeUpResponse
  );
  const shoutOutWeek = extractDataByWeek(
    currentWeek,
    shoutOutsResponse
  );
  const officeReferralWeek = extractDataByWeek(
    currentWeek,
    officeReferrals
  );
  const teacherReferralWeek = extractDataByWeek(
    currentWeek,
    writeUpResponse
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
            value: shoutOutWeek.length,
            name: "Positive Behavior Shout Out!",
            itemStyle: {
              color: "#008000",
            },
          },
          {
            value: behavioralConcerns.length,
            name: "Behavioral Concern",
            itemStyle: {
              color: "#FFFF00",
            },
          },
          {
            value: teacherReferralWeek.length,
            name: "Teacher Referrals",
            itemStyle: {
              color: "#ffA500",
            },
          },
          {
            value: officeReferralWeek.length,
            name: "Office Referrals",
            itemStyle: {
              color: "#ff0000",
            },
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
