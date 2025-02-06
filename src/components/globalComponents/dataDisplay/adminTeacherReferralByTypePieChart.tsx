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
  const inappropriateLanguage = GenerateBxByWeek(
    "Inappropriate Language",
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
            value: unauthorizedDeviceData[0].length,
            name: "Unauthorized Device/Cell Phone",
            itemStyle: {
              color: "#ff0000",
            },
          },
          {
            value: inappropriateLanguage[0].length,
            name: "Inappropriate Language",
            itemStyle: {
              color: "#a5142c",
            },
          },
          {
            value: disruptiveBehaviorData[0].length,
            name: "Disruptive Behavior",
            itemStyle: {
              color: "#ffA500",
            },
          },
          {
            value: dressCodeData[0].length,
            name: "Dress Code",
            itemStyle: {
              color: "#C7EA46",
            },
          },
          {
            value: tardyData[0].length,
            name: "Tardy",
            itemStyle: {
              color: "#800080",
            },
          },
          {
            value: horseplayData[0].length,
            name: "Horseplay",
            itemStyle: {
              color: "#964B00",
            },
          },
          {
            value: behavioralConcernData[0].length,
            name: "Behavioral Concern",
            itemStyle: {
              color: "#0000FF",
            },
          },
          {
            value: academicConcernData[0].length,
            name: "Academic Concern",
            itemStyle: {
              color: "#000000",
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
