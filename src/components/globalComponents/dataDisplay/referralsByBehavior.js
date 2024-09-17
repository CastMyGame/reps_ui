import ReactEcharts from "echarts-for-react";
import {
  findDataByWeekAndByPunishment,
  getCurrentWeekOfYear,
  getFirstDayOfWeek,
} from "../../../helperFunctions/helperFunctions";
import { useState } from "react";

export default function ReferralByBehavior({ data = [] }) {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  const yearAdj = (cw) => {
    if (cw > 0) return cw;
    if (cw <= 0) {
      return 52 + cw;
    }
  };

  const GenerateBxByWeek = (bx, numOfWeeks, data) => {
    const bxData = [];
    for (let i = 0; i < numOfWeeks; i++) {
      const weekNum = yearAdj(currentWeek - i);
      const dataForWeek = findDataByWeekAndByPunishment(weekNum, bx, data);
      bxData.push(dataForWeek);
    }
    return bxData;
  };

  const tardyData = GenerateBxByWeek("Tardy", rangeWeeks, data);
  const horseplayData = GenerateBxByWeek("Horseplay", rangeWeeks, data);
  const dressCodeData = GenerateBxByWeek("Dress Code", rangeWeeks, data);
  const shoutOutData = GenerateBxByWeek(
    "Positive Shout Out!",
    rangeWeeks,
    data
  );
  const concernData = GenerateBxByWeek("Behavioral Concern", rangeWeeks, data);
  const disruptiveData = GenerateBxByWeek(
    "Disruptive Behavior",
    rangeWeeks,
    data
  );
  const unauthorizedDevice = GenerateBxByWeek(
    "Unauthorized Device/Cell Phone",
    rangeWeeks,
    data
  );
  const teacherManagedData =
    GenerateBxByWeek("Disruptive Behavior", rangeWeeks, data) +
    GenerateBxByWeek("Unauthorized Device/Cell Phone", rangeWeeks, data) +
    GenerateBxByWeek("Tardy", rangeWeeks, data) +
    GenerateBxByWeek("Horseplay", rangeWeeks, data) +
    GenerateBxByWeek("Dress Code", rangeWeeks, data);

  const GenerateLabels = (rangeWeeks, currentWeek) => {
    const labels = [];
    for (let i = 0; i < rangeWeeks; i++) {
      const weekNum = yearAdj(currentWeek - i);
      const startDate = getFirstDayOfWeek(weekNum);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const label = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
      labels.push(label);
    }
    return labels.reverse();
  };

  const xLabels = GenerateLabels(rangeWeeks, currentWeek);
  const option = {
    responsive: true,
    maintainAspectRatio: false,
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: [
        "Teacher Managed Referrals",
        "Horseplay",
        "Dress Code",
        "Unauthorized Device/Cell Phone",
        "Positive Shout Out!",
        "Behavioral Concern",
      ],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "8%",
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
      data: xLabels,
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
        data: disruptiveData,
      },
      {
        name: "Behavioral Concern",
        type: "line",
        stack: "Total",
        data: concernData,
      },
      {
        name: "Positive Shout Out!",
        type: "line",
        stack: "Total",
        data: shoutOutData,
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
        data: unauthorizedDevice,
      },
    ],
  };

  return (
    <div style={{ maxHeight: "100%", maxWidth: "100%" }}>
      <ReactEcharts option={option} />
    </div>
  );
}
