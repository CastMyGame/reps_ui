import ReactEcharts from "echarts-for-react";
import {
  extractDataByWeek,
  getCurrentWeekOfYear,
  getFirstDayOfWeek,
} from "../../../helperFunctions/helperFunctions";
import { useState } from "react";

export default function StudentReferralsByWeek({ data = [] }) {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  // Adjust the week number if current week extends prior to this year
  const yearAdj = (cw) => {
    return cw > 0 ? cw : 52 + cw;
  };

  const GenerateChartData = (currentWeek, rangeWeeks, data) => {
    const genData = [];

    for (let i = 0; i < rangeWeeks; i++) {
      const weekKey = yearAdj(currentWeek - i);
      const weekData = extractDataByWeek(weekKey, data).length;

      const startDate = getFirstDayOfWeek(weekKey);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const label = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;

      genData.push({
        [label]: weekData,
      });
    }

    return genData;
  };

  const displayDate = GenerateChartData(currentWeek, rangeWeeks, data);
  displayDate.reverse();

  const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]);
  const seriesData = displayDate.map((obj) => Object.values(obj)[0] || 0);

  const option = {
    title: {
      text: "Stacked Line",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["Student Referrals"],
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
        name: "Student Referrals",
        type: "line",
        stack: "Total",
        data: seriesData,
      },
    ],
  };

  return (
    <div id="main-graph">
      <ReactEcharts option={option} />
    </div>
  );
}
