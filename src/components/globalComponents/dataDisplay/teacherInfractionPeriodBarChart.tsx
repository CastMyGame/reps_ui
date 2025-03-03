import React from "react";
import {
  currentWeek,
  extractDataByWeek,
  findDataByWeekAndByPunishment,
} from "src/helperFunctions/helperFunctions";
import ReactEcharts from "echarts-for-react";

const TeacherInfractionOverPeriodBarChart = ({ data = [] }) => {
  const weekData = extractDataByWeek(currentWeek, data || []);
  const tardybehavior = findDataByWeekAndByPunishment(
    currentWeek,
    "Tardy",
    weekData || []
  );
  const disruptivebehavior = findDataByWeekAndByPunishment(
    currentWeek,
    "Disruptive Behavior",
    weekData || []
  );
  const horseplay = findDataByWeekAndByPunishment(
    currentWeek,
    "Horseplay",
    weekData || []
  );
  const dressCode = findDataByWeekAndByPunishment(
    currentWeek,
    "Dress Code",
    weekData || []
  );
  const cellPhone = findDataByWeekAndByPunishment(
    currentWeek,
    "Unauthorized Device/Cell Phone",
    weekData || []
  );
  const behavioralConcern = findDataByWeekAndByPunishment(
    currentWeek,
    "Behavioral Concern",
    weekData || []
  );
  const ftc = findDataByWeekAndByPunishment(
    currentWeek,
    "Failure to Complete Work",
    weekData || []
  );
  const innappropriateLanguage = findDataByWeekAndByPunishment(
    currentWeek,
    "Inappropriate Language",
    weekData || []
  );

  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      show: true,
      orient: "horizontal",
      top: "top",
    },
    xAxis: {
      type: "category",
      show: false,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Behavioral Concern",
        type: "bar",
        data: [behavioralConcern.length],
        itemStyle: {
          color: "#0000FF",
        },
      },
      {
        name: "Disruptive Behavior",
        type: "bar",
        data: [disruptivebehavior.length],
        itemStyle: {
          color: "#ffA500",
        },
      },
      {
        name: "Dress Code",
        type: "bar",
        data: [dressCode.length],
        itemStyle: {
          color: "#C7EA46",
        },
      },
      {
        name: "Failure to Complete Work",
        type: "bar",
        data: [ftc.length],
        itemStyle: {
          color: "#000000",
        },
      },
      {
        name: "Horseplay",
        type: "bar",
        data: [horseplay.length],
        itemStyle: {
          color: "#964B00",
        },
      },
      {
        name: "Inappropriate Language",
        type: "bar",
        data: [innappropriateLanguage.length],
        itemStyle: {
          color: "#FFC0CB",
        },
      },
      {
        name: "Tardy",
        type: "bar",
        data: [tardybehavior.length],
        itemStyle: {
          color: "#800080",
        },
      },
      {
        name: "Unauthorized Device/Cell Phone",
        type: "bar",
        data: [cellPhone.length],
        itemStyle: {
          color: "#ff0000",
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

export default TeacherInfractionOverPeriodBarChart;
