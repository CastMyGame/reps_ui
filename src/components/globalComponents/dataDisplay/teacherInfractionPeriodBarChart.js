import React from "react";
import {
  currentWeek,
  extractDataByWeek,
  findDataByWeekAndByPunishment,
  getIncidentByBehavior,
} from "src/helperFunctions/helperFunctions";
import ReactEcharts from "echarts-for-react";

const TeacherInfractionOverPeriodBarChart = ({ data = [] }) => {
  const weekData = extractDataByWeek(currentWeek, data);
  console.log("The week data ", weekData);
  const tardybehavior = findDataByWeekAndByPunishment(
    currentWeek,
    "Tardy",
    weekData
  );
  const disruptivebehavior = findDataByWeekAndByPunishment(
    currentWeek,
    "Disruptive Behavior",
    weekData
  );
  const horseplay = findDataByWeekAndByPunishment(
    currentWeek,
    "Horseplay",
    weekData
  );
  const dressCode = findDataByWeekAndByPunishment(
    currentWeek,
    "Dress Code",
    weekData
  );
  const cellPhone = findDataByWeekAndByPunishment(
    currentWeek,
    "Unauthorized Device/Cell Phone",
    weekData
  );
  const behavioralConcern = findDataByWeekAndByPunishment(
    currentWeek,
    "Behavioral Concern",
    weekData
  );
  const ftc = findDataByWeekAndByPunishment(
    currentWeek,
    "Failure to Complete Work",
    weekData
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
        name: "Tardy",
        type: "bar",
        data: [tardybehavior],
      },
      {
        name: "Dress Code",
        type: "bar",
        data: [dressCode],
      },
      {
        name: "Disruptive Behavior",
        type: "bar",
        data: [disruptivebehavior],
      },
      {
        name: "Behavioral Concern",
        type: "bar",
        data: [behavioralConcern],
      },
      {
        name: "Horseplay",
        type: "bar",
        data: [horseplay],
      },
      {
        name: "Unauthorized Device/Cell Phone",
        type: "bar",
        data: [cellPhone],
      },
      {
        name: "Failure to Complete Work",
        type: "bar",
        data: [ftc],
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
