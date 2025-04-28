import React, { useState } from "react";
import ReactEcharts from "echarts-for-react";
import "./CustomPieChart.css";
import { TeacherDto } from "src/types/responses";
import {
  countLast7Days,
  GenerateBxByWeek,
} from "src/helperFunctions/helperFunctions";

interface AdminTeacherByTypeProps {
  writeUpResponse: TeacherDto[];
}

export const AdminTeacherReferralByTypePieChart: React.FC<
  AdminTeacherByTypeProps
> = ({ writeUpResponse }) => {
  const tardyData = countLast7Days(
    writeUpResponse || [],
    (item) => item.infractionName === "Tardy"
  );
  const horseplayData = countLast7Days(
    writeUpResponse || [],
    (item) => item.infractionName === "Horseplay"
  );
  const dressCodeData = countLast7Days(
    writeUpResponse || [],
    (item) => item.infractionName === "Dress Code"
  );
  const unauthorizedDeviceData = countLast7Days(
    writeUpResponse || [],
    (item) => item.infractionName === "Unauthorized Device/Cell Phone"
  );

  const disruptiveBehaviorData = countLast7Days(
    writeUpResponse || [],
    (item) => item.infractionName === "Disruptive Behavior"
  );
  const inappropriateLanguage = countLast7Days(
    writeUpResponse || [],
    (item) => item.infractionName === "Inappropriate Language"
  );
  const behavioralConcernData = countLast7Days(
    writeUpResponse || [],
    (item) => item.infractionName === "Behavioral Concern"
  );
  const academicConcernData = countLast7Days(
    writeUpResponse || [],
    (item) => item.infractionName === "Academic Concern"
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
            value: unauthorizedDeviceData,
            name: "Unauthorized Device/Cell Phone",
            itemStyle: {
              color: "#ff0000",
            },
          },
          {
            value: inappropriateLanguage,
            name: "Inappropriate Language",
            itemStyle: {
              color: "#a5142c",
            },
          },
          {
            value: disruptiveBehaviorData,
            name: "Disruptive Behavior",
            itemStyle: {
              color: "#ffA500",
            },
          },
          {
            value: dressCodeData,
            name: "Dress Code",
            itemStyle: {
              color: "#C7EA46",
            },
          },
          {
            value: tardyData,
            name: "Tardy",
            itemStyle: {
              color: "#800080",
            },
          },
          {
            value: horseplayData,
            name: "Horseplay",
            itemStyle: {
              color: "#964B00",
            },
          },
          {
            value: behavioralConcernData,
            name: "Behavioral Concern",
            itemStyle: {
              color: "#0000FF",
            },
          },
          {
            value: academicConcernData,
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
    <ReactEcharts style={{ height: "40vh", width: "100%" }} option={option} />
  );
};
