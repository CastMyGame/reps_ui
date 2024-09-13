import React from "react";
import { axisClasses } from "@mui/x-charts";
import { getIncidentByBehavior } from "src/helperFunctions/helperFunctions";
import ReactEcharts from "echarts-for-react";

const TeacherInfractionOverPeriodBarChart = ({ data = [] }) => {
  const tardybehavior = {
    incidents: getIncidentByBehavior("Tardy", data),
    behavior: "Tardy",
  };
  const disruptivebehavior = {
    incidents: getIncidentByBehavior("Disruptive Behavior", data),
    behavior: "Disruptive Behavior",
  };
  const horseplay = {
    incidents: getIncidentByBehavior("Horseplay", data),
    behavior: "Horseplay",
  };
  const dressCode = {
    incidents: getIncidentByBehavior("Dress Code", data),
    behavior: "Dress Code",
  };
  const cellPhone = {
    incidents: 8,
    // incidents: getIncidentByBehavior("Unauthorized Device/Cell Phone", data),
    behavior: "Unauthorized Device/Cell Phone",
  };
  const behavioralConcern = {
    incidents: 3,
    // incidents: getIncidentByBehavior("Behavioral Concern", data),
    behavior: "Behavioral Concern",
  };
  const ftc = {
    incidents: 6,
    // incidents: getIncidentByBehavior("Failure to Complete Work", data),
    behavior: "Failure to Complete Work",
  };

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
        data: [tardybehavior.incidents],
      },
      {
        name: "Dress Code",
        type: "bar",
        data: [dressCode.incidents],
      },
      {
        name: "Disruptive Behavior",
        type: "bar",
        data: [disruptivebehavior.incidents],
      },
      {
        name: "Behavioral Concern",
        type: "bar",
        data: [behavioralConcern.incidents],
      },
      {
        name: "Horseplay",
        type: "bar",
        data: [horseplay.incidents],
      },
      {
        name: "Unauthorized Device/Cell Phone",
        type: "bar",
        data: [cellPhone.incidents],
      },
      {
        name: "Failure to Complete Work",
        type: "bar",
        data: [ftc.incidents],
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
