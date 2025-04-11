import React, { useState } from "react";
import ReactEcharts from "echarts-for-react";
import "./CustomPieChart.css";
import { TeacherDto } from "src/types/responses";
import {
  GenerateBxByWeek,
} from "src/helperFunctions/helperFunctions";

interface AdminTeacherByTypeProps {
  writeUpResponse: TeacherDto[];
}

export const AdminTeacherReferralByTypePieChart: React.FC<AdminTeacherByTypeProps> = ({
  writeUpResponse,
}) => {
  const [rangeWeeks, setRangeWeeks] = useState(10);

  const tardyData = GenerateBxByWeek(
    "Tardy",
    rangeWeeks,
    writeUpResponse
  );
  const horseplayData = GenerateBxByWeek(
    "Horseplay",
    rangeWeeks,
    writeUpResponse
  );
  const dressCodeData = GenerateBxByWeek(
    "Dress Code",
    rangeWeeks,
    writeUpResponse
  );
  const unauthorizedDeviceData = GenerateBxByWeek(
    "Unauthorized Device/Cell Phone",
    rangeWeeks,
    writeUpResponse
  );
  const disruptiveBehaviorData = GenerateBxByWeek(
    "Disruptive Behavior",
    rangeWeeks,
    writeUpResponse
  );
  const inappropriateLanguage = GenerateBxByWeek(
    "Inappropriate Language",
    rangeWeeks,
    writeUpResponse
  );
  const behavioralConcernData = GenerateBxByWeek(
    "Behavioral Concern",
    rangeWeeks,
    writeUpResponse
  );
  const academicConcernData = GenerateBxByWeek(
    "Academic Concern",
    rangeWeeks,
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
            value: unauthorizedDeviceData.reduce((a, b) => a + b, 0),
            name: "Unauthorized Device/Cell Phone",
            itemStyle: {
              color: "#ff0000",
            },
          },
          {
            value: inappropriateLanguage.reduce((a, b) => a + b, 0),
            name: "Inappropriate Language",
            itemStyle: {
              color: "#a5142c",
            },
          },
          {
            value: disruptiveBehaviorData.reduce((a, b) => a + b, 0),
            name: "Disruptive Behavior",
            itemStyle: {
              color: "#ffA500",
            },
          },
          {
            value: dressCodeData.reduce((a, b) => a + b, 0),
            name: "Dress Code",
            itemStyle: {
              color: "#C7EA46",
            },
          },
          {
            value: tardyData.reduce((a, b) => a + b, 0),
            name: "Tardy",
            itemStyle: {
              color: "#800080",
            },
          },
          {
            value: horseplayData.reduce((a, b) => a + b, 0),
            name: "Horseplay",
            itemStyle: {
              color: "#964B00",
            },
          },
          {
            value: behavioralConcernData.reduce((a, b) => a + b, 0),
            name: "Behavioral Concern",
            itemStyle: {
              color: "#0000FF",
            },
          },
          {
            value: academicConcernData.reduce((a, b) => a + b, 0),
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
