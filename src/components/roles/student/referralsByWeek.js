import ReactEcharts from "echarts-for-react";
import {
  extractDataByWeek,
  extractDataByWeekFirstDay,
  getCurrentWeekOfYear,
  getFirstDayOfWeek,
} from "../../../helperFunctions/helperFunctions";
import { useState } from "react";

export default function StudentReferralsByWeek({ data = [] }) {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  //This helps adjust the week number if current week extend prior to this year
  const yearAdj = (cw) => {
    if (cw > 0) return cw;
    if (cw <= 0) {
      return 52 + cw;
    }
  };

  const GenerateChartData = (currentWeek, rangeWeeks, data) => {
    const genData = [];

    for (let i = 0; i < rangeWeeks; i++) {
      const weekKey = yearAdj(currentWeek - i);
      const weekData = extractDataByWeek(yearAdj(currentWeek - i), data).length; // Assuming findDataByWeek and yearAdj are defined elsewhere

      const startDate = getFirstDayOfWeek(yearAdj(currentWeek - i));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Assuming you want to show the end date of the week

      const label = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;

      genData.push({
        [label]: weekData,
      });
    }

    return genData;
  };

  const displayDate = GenerateChartData(currentWeek, rangeWeeks, data);

  //This reverses the x axis
  displayDate.reverse();

  // Convert the weekMap to the format suitable for LineChart
  const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]); // Extract the keys (labels)
  const seriesData = displayDate.map((obj) => Object.values(obj)[0] || 0); // Extract the values associated with the keys

  //Options variables for eChart
  var option = {
    title: {
      text: "Referrals By Type",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: [
        "Tardy",
        "Dress Code",
        "Unauthorized Device",
        "Horseplay",
        "Disruptive Behavior",
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
      type: "value",
      boundaryGap: false,
      data: [xAxisData],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Tardy",
        type: "line",
        stack: "Total",
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: "Dress Code",
        type: "line",
        stack: "Total",
        data: [220, 182, 191, 234, 290, 330, 310],
      },
      {
        name: "Unauthorized Device",
        type: "line",
        stack: "Total",
        data: [150, 232, 201, 154, 190, 330, 410],
      },
      {
        name: "Horseplay",
        type: "line",
        stack: "Total",
        data: [320, 332, 301, 334, 390, 330, 320],
      },
      {
        name: "Disruptive behavior",
        type: "line",
        stack: "Total",
        data: [820, 932, 901, 934, 1290, 1330, 1320],
      },
    ],
  };

  return (
    console.log(
      xAxisData + " X AXIS DATA"
    ) &&
    option && (
      <>
        <ReactEcharts option={option} />
      </>
    )
  );
}
