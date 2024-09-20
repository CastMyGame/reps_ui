import React, { useState } from "react";
import ReactEcharts from "echarts-for-react";
import "./CustomPieChart.css";
import { AdminOverviewDto, TeacherDto } from "src/types/responses";
import {
  extractDataByWeek,
  getCurrentWeekOfYear,
  GenerateBxByWeek,
} from "src/helperFunctions/helperFunctions";

export const AdminTeacherReferralByTypePieChart: React.FC<AdminOverviewDto> = ({
  writeUpResponse = [],
}) => {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  const tardyData = GenerateBxByWeek(
    "Tardy",
    rangeWeeks,
    writeUpResponse as TeacherDto[]
  );
  const horseplayData = GenerateBxByWeek(
    "Horseplay",
    rangeWeeks,
    writeUpResponse as TeacherDto[]
  );
  const dressCodeData = GenerateBxByWeek(
    "Dress Code",
    rangeWeeks,
    writeUpResponse as TeacherDto[]
  );
  const unauthorizedDeviceData = GenerateBxByWeek(
    "Unauthorized Device/Cell Phone",
    rangeWeeks,
    writeUpResponse as TeacherDto[]
  );
  const disruptiveBehaviorData = GenerateBxByWeek(
    "Disruptive Behavior",
    rangeWeeks,
    writeUpResponse as TeacherDto[]
  );
  const behavioralConcernData = GenerateBxByWeek(
    "Behavioral Concern",
    rangeWeeks,
    writeUpResponse as TeacherDto[]
  );
  const academicConcernData = GenerateBxByWeek(
    "Academic Concern",
    rangeWeeks,
    writeUpResponse as TeacherDto[]
  );

  const option = {
    responsive: true,
    maintainAspectRatio: false,
    // title: {
    //   text: "Teacher Managed Referrals by Type",
    //   left: "center",
    // },
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
            value: unauthorizedDeviceData,
            name: "Unauthorized Device/Cell Phone",
          },
          {
            value: tardyData,
            name: "Tardy",
          },
          {
            value: horseplayData,
            name: "Horseplay",
          },
          {
            value: dressCodeData,
            name: "Dress Code",
          },
          {
            value: disruptiveBehaviorData,
            name: "Disruptive Behavior",
          },
          {
            value: behavioralConcernData,
            name: "Behavioral Concern",
          },
          {
            value: academicConcernData,
            name: "Academic Concern",
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
