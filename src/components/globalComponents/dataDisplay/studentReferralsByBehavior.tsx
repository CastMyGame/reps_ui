import ReactEcharts from "echarts-for-react";
import {
  getCurrentWeekOfYear,
  GenerateBxByWeek,
  GenerateChartData,
} from "../../../helperFunctions/helperFunctions";
import { useEffect, useState } from "react";
import { TeacherReferral } from "src/types/responses";

interface StudentReferralsProps {
  data: TeacherReferral[];
}

const StudentReferralsByWeek: React.FC<StudentReferralsProps> = ({ data }) => {
  const [rangeWeeks, setRangeWeeks] = useState(10);
  const [xAxisData, setXAxisData] = useState<string[]>([]);
  const [seriesData, setSeriesData] = useState<any[]>([]);

  const currentWeek = getCurrentWeekOfYear();

  // Recalculate X-axis (date range) and series data every time `rangeWeeks` changes
  useEffect(() => {
    const displayDate = GenerateChartData(currentWeek, rangeWeeks, data);

    // X-axis: week date ranges
    const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]); // Extract the week date ranges
    setXAxisData(xAxisData);

    // Y-axis: Generate data for each series based on the same rangeWeeks
    const tardyData = GenerateBxByWeek("Tardy", rangeWeeks, data);
    const horseplayData = GenerateBxByWeek("Horseplay", rangeWeeks, data);
    const dressCodeData = GenerateBxByWeek("Dress Code", rangeWeeks, data);
    const unauthorizedDeviceData = GenerateBxByWeek(
      "Unauthorized Device/Cell Phone",
      rangeWeeks,
      data
    );
    const disruptiveBehaviorData = GenerateBxByWeek(
      "Disruptive Behavior",
      rangeWeeks,
      data
    );
    const positiveData = GenerateBxByWeek(
      "Positive Behavior Shout Out!",
      rangeWeeks,
      data
    );
    const behavioralConcernData = GenerateBxByWeek(
      "Behavioral Concern",
      rangeWeeks,
      data
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
        name: "Dress Code",
        type: "line",
        stack: "Total",
        data: dressCodeData,
        itemStyle: {
          color: "#C7EA46",
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
        name: "Behavioral Concern",
        type: "line",
        stack: "Total",
        data: behavioralConcernData,
        itemStyle: {
          color: "#0000FF",
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
        name: "Horseplay",
        type: "line",
        stack: "Total",
        data: horseplayData,
        itemStyle: {
          color: "#964B00",
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
  }, [rangeWeeks, data, currentWeek]);

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
      right: "3%",
      bottom: "10%",
      top: "10%",
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
      data: xAxisData.reverse(), // Use the recalculated date ranges for the x-axis
    },
    yAxis: {
      type: "value",
    },
    series: seriesData, // Use the recalculated Y-axis data for each series
  };

  return (
    <div
      style={{
        width: "100%", // Makes the chart fit the container's width
        height: "calc(50vh - 20px)", // Set a fixed height or use a percentage value (e.g., "50%")
        overflow: "hidden", // Prevents overflow of the chart
      }}
    >
      <ReactEcharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
};

export default StudentReferralsByWeek;
