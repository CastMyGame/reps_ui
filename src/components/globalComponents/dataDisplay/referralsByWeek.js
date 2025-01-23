import ReactEcharts from "echarts-for-react";
import {
  getCurrentWeekOfYear,
  GenerateChartData,
  GenerateBxByWeek,
} from "../../../helperFunctions/helperFunctions";
import { useEffect, useState } from "react";

export const TotalReferralByWeek = ({
  punishmentResponse = [],
  officeReferrals = [],
}) => {
  const [rangeWeeks, setRangeWeeks] = useState(10);
  const [xAxisData, setXAxisData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  const currentWeek = getCurrentWeekOfYear();

  useEffect(() => {
    // Validate and sanitize input data
    const safePunishmentResponse = Array.isArray(punishmentResponse)
      ? punishmentResponse
      : [];
    const safeOfficeReferrals = Array.isArray(officeReferrals)
      ? officeReferrals
      : [];

    const displayDate = GenerateChartData(
      currentWeek,
      rangeWeeks,
      safePunishmentResponse
    );

    const tardyData = GenerateBxByWeek("Tardy", rangeWeeks, safePunishmentResponse);
    const horseplayData = GenerateBxByWeek(
      "Horseplay",
      rangeWeeks,
      safePunishmentResponse
    );
    const dressCodeData = GenerateBxByWeek(
      "Dress Code",
      rangeWeeks,
      safePunishmentResponse
    );
    const unauthorizedDeviceData = GenerateBxByWeek(
      "Unauthorized Device/Cell Phone",
      rangeWeeks,
      safePunishmentResponse
    );
    const disruptiveBehaviorData = GenerateBxByWeek(
      "Disruptive Behavior",
      rangeWeeks,
      safePunishmentResponse
    );
    const positiveData = GenerateBxByWeek(
      "Positive Shout Out!",
      rangeWeeks,
      safePunishmentResponse
    );
    const behavioralConcernData = GenerateBxByWeek(
      "Behavioral Concern",
      rangeWeeks,
      safePunishmentResponse
    );
    const officeReferralData = GenerateBxByWeek(
      "Office Referral",
      rangeWeeks,
      safeOfficeReferrals
    );

    // Calculate Teacher Managed Referrals as the sum of selected infractions
    const teacherManagedReferrals = tardyData.map((_, index) => {
      return (
        (tardyData[index] || 0) +
        (horseplayData[index] || 0) +
        (dressCodeData[index] || 0) +
        (unauthorizedDeviceData[index] || 0) +
        (disruptiveBehaviorData[index] || 0)
      );
    });

    // X-axis: week date ranges
    const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]); // Extract the week date ranges
    setXAxisData(xAxisData); // Y-axis: Generate data for each series based on the same rangeWeeks

    // Set the series data
    setSeriesData([
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
        name: "Behavioral Concern",
        type: "line",
        stack: "Total",
        data: behavioralConcernData,
        itemStyle: {
          color: "#FFFF00",
        },
      },
      {
        name: "Teacher Managed",
        type: "line",
        stack: "Total",
        data: teacherManagedReferrals,
        itemStyle: {
          color: "#ffA500",
        },
      },
      {
        name: "Office Managed",
        type: "line",
        stack: "Total",
        data: officeReferralData,
        itemStyle: {
          color: "#ff0000",
        },
      },
    ]);
  }, [rangeWeeks, punishmentResponse, officeReferrals, currentWeek]);

  const option = {
    responsive: true,
    maintainAspectRatio: false,
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: [
        "Behavioral Concern",
        "Positive Shout Out!",
        "Teacher Managed",
        "Office Managed",
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
      inverse: true,
      data: xAxisData,
    },
    yAxis: {
      type: "value",
    },
    series: seriesData, // Use the recalculated Y-axis data for each series,
  };

  return (
    <div style={{ maxHeight: "100%", maxWidth: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setRangeWeeks((prev) => Math.max(prev - 1, 1))}
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
      <ReactEcharts option={option}></ReactEcharts>
    </div>
  );
};
