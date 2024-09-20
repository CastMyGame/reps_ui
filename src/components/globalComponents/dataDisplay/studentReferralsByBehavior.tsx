import ReactEcharts from "echarts-for-react";
import {
  getCurrentWeekOfYear,
  GenerateBxByWeek,
  GenerateChartData
} from "../../../helperFunctions/helperFunctions";
import { useState } from "react";
import { StudentPunishment, TeacherDto, TeacherReferral } from "src/types/responses";

const StudentReferralsByWeek: React.FC<StudentPunishment> = ({ data = [] }) => {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  const displayDate = GenerateChartData(
    currentWeek,
    rangeWeeks,
    data as TeacherDto[]
  );
  displayDate.reverse();

  const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]);
  const seriesData = displayDate.map((obj) => Object.values(obj)[0] || 0);

  const tardyData = GenerateBxByWeek(
    "Tardy",
    rangeWeeks,
    data as TeacherDto[]
  );
  const horseplayData = GenerateBxByWeek(
    "Horseplay",
    rangeWeeks,
    data as TeacherDto[]
  );
  const dressCodeData = GenerateBxByWeek(
    "Dress Code",
    rangeWeeks,
    data as TeacherDto[]
  );
  const unauthorizedDeviceData = GenerateBxByWeek(
    "Unauthorized Device/Cell Phone",
    rangeWeeks,
    data as TeacherDto[]
  );
  const disruptiveBehaviorData = GenerateBxByWeek(
    "Disruptive Behavior",
    rangeWeeks,
    data as TeacherDto[]
  );
  const positiveData = GenerateBxByWeek(
    "Positive Shout Out!",
    rangeWeeks,
    data as TeacherDto[]
  );
  const behavioralConcernData = GenerateBxByWeek(
    "Behavioral Concern",
    rangeWeeks,
    data as TeacherDto[]
  );

  const option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: [
        "Tardy",
        "Horseplay",
        "Positive Shout Out!",
        "Dress Code",
        "Behavioral Concern",
        "Disruptive Behavior",
        "Unauthorized Device/Cell Phone",
      ],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxisData,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Tardy",
        type: "line",
        stack: "Total",
        data: tardyData,
      },
      {
        name: "Dress Code",
        type: "line",
        stack: "Total",
        data: dressCodeData,
      },
      {
        name: "Disruptive Behavior",
        type: "line",
        stack: "Total",
        data: disruptiveBehaviorData,
      },
      {
        name: "Behavioral Concern",
        type: "line",
        stack: "Total",
        data: behavioralConcernData,
      },
      {
        name: "Positive Shout Out!",
        type: "line",
        stack: "Total",
        data: positiveData,
      },
      {
        name: "Horseplay",
        type: "line",
        stack: "Total",
        data: horseplayData,
      },
      {
        name: "Unauthorized Device/Cell Phone",
        type: "line",
        stack: "Total",
        data: unauthorizedDeviceData,
      },
    ],
  };

  return (
    <div>
      <ReactEcharts option={option} />
    </div>
  );
};

export default StudentReferralsByWeek;
