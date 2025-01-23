import ReactEcharts from "echarts-for-react";
import {
  GenerateChartData,
  GenerateBxByWeek,
  getCurrentWeekOfYear,
} from "../../../helperFunctions/helperFunctions";
import { useEffect, useState } from "react";

export default function ReferralByBehavior({ data = [] }) {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const [xAxisData, setXAxisData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  const currentWeek = getCurrentWeekOfYear();

  // Ensure `data` is valid and default to an empty array if not
  const safeData = Array.isArray(data) ? data : [];

  // Recalculate X-axis (date range) and series data every time `rangeWeeks` or `data` changes
  useEffect(() => {
    const displayDate = GenerateChartData(currentWeek, rangeWeeks, safeData);

    // X-axis: week date ranges
    const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]); // Extract the week date ranges
    setXAxisData(xAxisData);

    // Y-axis: Generate data for each series based on the same rangeWeeks
    const tardyData = GenerateBxByWeek("Tardy", rangeWeeks, safeData);
    const horseplayData = GenerateBxByWeek("Horseplay", rangeWeeks, safeData);
    const dressCodeData = GenerateBxByWeek("Dress Code", rangeWeeks, safeData);
    const unauthorizedDeviceData = GenerateBxByWeek(
      "Unauthorized Device/Cell Phone",
      rangeWeeks,
      safeData
    );
    const disruptiveBehaviorData = GenerateBxByWeek(
      "Disruptive Behavior",
      rangeWeeks,
      safeData
    );
    const positiveData = GenerateBxByWeek(
      "Positive Shout Out!",
      rangeWeeks,
      safeData
    );
    const behavioralConcernData = GenerateBxByWeek(
      "Behavioral Concern",
      rangeWeeks,
      safeData
    );

    // Set the series data
    setSeriesData([
      {
        name: "Tardy",
        type: "line",
        stack: "Total",
        data: tardyData,
        itemStyle: {
          color: "#800080",
        },
      },
      {
        name: "Horseplay",
        type: "line",
        stack: "Total",
        data: horseplayData,
        itemStyle: {
          color: "#964B00",
        },
      },
      {
        name: "Positive Shout Out!",
        type: "line",
        stack: "Total",
        data: positiveData,
        itemStyle: {
          color: "#008000",
        },
      },
      {
        name: "Dress Code",
        type: "line",
        stack: "Total",
        data: dressCodeData,
        itemStyle: {
          color: "#C7EA46",
        },
      },
      {
        name: "Behavioral Concern",
        type: "line",
        stack: "Total",
        data: behavioralConcernData,
        itemStyle: {
          color: "#0000FF",
        },
      },
      {
        name: "Disruptive Behavior",
        type: "line",
        stack: "Total",
        data: disruptiveBehaviorData,
        itemStyle: {
          color: "#ffA500",
        },
      },
      {
        name: "Unauthorized Device/Cell Phone",
        type: "line",
        stack: "Total",
        data: unauthorizedDeviceData,
        itemStyle: {
          color: "#ff0000",
        },
      },
    ]);
  }, [rangeWeeks, safeData, currentWeek]);

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
      inverse: true,
      data: xAxisData, // Use the recalculated date ranges for the x-axis
    },
    yAxis: {
      type: "value",
    },
    series: seriesData, // Use the recalculated Y-axis data for each series
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setRangeWeek((prev) => (prev > 1 ? prev - 1 : prev))}
          style={{
            backgroundColor: "#5D949D",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Weeks -1
        </button>
        <button
          onClick={() => setRangeWeek((prev) => prev + 1)}
          style={{
            backgroundColor: "#5D949D",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Weeks +1
        </button>
      </div>
      <ReactEcharts option={option} />
    </div>
  );
}
