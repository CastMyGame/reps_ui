import ReactEcharts from "echarts-for-react";
import {
  GenerateChartData,
  GenerateBxByWeek,
  getCurrentWeekOfYear,
} from "../../../helperFunctions/helperFunctions";
import { useEffect, useState } from "react";
import { TeacherDto } from "src/types/responses";

interface ReferralByBehaviorProps {
  data: TeacherDto[];
}

interface SeriesData {
  name: string;
  type: string;
  data: number[];
  itemStyle: { color: string };
}

export const ReferralByBehavior: React.FC<ReferralByBehaviorProps> = ({
  data = [],
}) => {
  const [rangeWeeks, setRangeWeeks] = useState(10);
  const [xAxisData, setXAxisData] = useState<string[]>([]);
  const [seriesData, setSeriesData] = useState<SeriesData[]>([]);

  const currentWeek = getCurrentWeekOfYear();

  // Recalculate X-axis (date range) and series data every time `rangeWeeks` or `data` changes
  useEffect(() => {
    // Ensure `data` is valid and default to an empty array if not
    const safeData = Array.isArray(data) ? data : [];

    const displayDate = GenerateChartData(
      currentWeek - rangeWeeks + 1,
      rangeWeeks,
      safeData
    );

    // X-axis: week date ranges
    const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]).reverse(); // Extract the week date ranges
    setXAxisData(xAxisData);

    // Y-axis: Generate data for each series based on the same rangeWeeks
    const tardyData = GenerateBxByWeek("Tardy", rangeWeeks, safeData)
      .map((week) => week)
      .reverse();
    const horseplayData = GenerateBxByWeek("Horseplay", rangeWeeks, safeData)
      .map((week) => week)
      .reverse();
    const dressCodeData = GenerateBxByWeek("Dress Code", rangeWeeks, safeData)
      .map((week) => week)
      .reverse();
    const unauthorizedDeviceData = GenerateBxByWeek(
      "Unauthorized Device/Cell Phone",
      rangeWeeks,
      safeData
    )
      .map((week) => week)
      .reverse();
    const disruptiveBehaviorData = GenerateBxByWeek(
      "Disruptive Behavior",
      rangeWeeks,
      safeData
    )
      .map((week) => week)
      .reverse();
    const positiveData = GenerateBxByWeek(
      "Positive Behavior Shout Out!",
      rangeWeeks,
      safeData
    )
      .map((week) => week)
      .reverse();
    const behavioralConcernData = GenerateBxByWeek(
      "Behavioral Concern",
      rangeWeeks,
      safeData
    )
      .map((week) => week)
      .reverse();
    const inappropriateLanguageData = GenerateBxByWeek(
      "Inappropriate Language",
      rangeWeeks,
      safeData
    )
      .map((week) => week)
      .reverse();

    // Set the series data
    setSeriesData([
      {
        name: "Behavioral Concern",
        type: "line",
        data: behavioralConcernData,
        itemStyle: {
          color: "#0000FF",
        },
      },
      {
        name: "Disruptive Behavior",
        type: "line",
        data: disruptiveBehaviorData,
        itemStyle: {
          color: "#ffA500",
        },
      },
      {
        name: "Dress Code",
        type: "line",
        data: dressCodeData,
        itemStyle: {
          color: "#C7EA46",
        },
      },
      {
        name: "Horseplay",
        type: "line",
        data: horseplayData,
        itemStyle: {
          color: "#964B00",
        },
      },
      {
        name: "Inappropriate Language",
        type: "line",
        data: inappropriateLanguageData,
        itemStyle: {
          color: "#FFC0CB",
        },
      },
      {
        name: "Positive Behavior Shout Out!",
        type: "line",
        data: positiveData,
        itemStyle: {
          color: "#008000",
        },
      },
      {
        name: "Tardy",
        type: "line",
        data: tardyData,
        itemStyle: {
          color: "#800080",
        },
      },
      {
        name: "Unauthorized Device/Cell Phone",
        type: "line",
        data: unauthorizedDeviceData,
        itemStyle: {
          color: "#ff0000",
        },
      },
    ]);
  }, [rangeWeeks, data, currentWeek]);

  const option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: [
        "Behavioral Concern",
        "Disruptive Behavior",
        "Dress Code",
        "Horseplay",
        "Inappropriate Language",
        "Positive Behavior Shout Out!",
        "Tardy",
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
      data: xAxisData, // Use the recalculated date ranges for the x-axis
    },
    yAxis: {
      type: "value",
    },
    series: seriesData, // Use the recalculated Y-axis data for each series
  };

  return (
    <div style={{
        width: "100%", // Makes the chart fit the container's width
        height: "calc(50vh - 20px)", // Set a fixed height or use a percentage value (e.g., "50%")
        overflow: "auto", // Prevents overflow of the chart
      }}>
      <ReactEcharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setRangeWeeks((prev) => (prev > 1 ? prev - 1 : prev))}
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
          onClick={() => setRangeWeeks((prev) => prev + 1)}
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
    </div>
  );
};
