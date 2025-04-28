import ReactEcharts from "echarts-for-react";
import {
  getCurrentWeekOfYear,
  GenerateChartData,
  GenerateBxByWeek,
} from "../../../helperFunctions/helperFunctions";
import { useEffect, useState } from "react";
import { OfficeReferral, TeacherDto } from "src/types/responses";

interface SeriesData {
  name: string;
  type: string;
  data: number[];
  itemStyle: { color: string };
}

interface TotalReferralProps {
  punishmentResponse: TeacherDto[];
  officeReferrals: OfficeReferral[];
}

export const TotalReferralByWeek: React.FC<TotalReferralProps> = ({
  punishmentResponse = [],
  officeReferrals = [],
}) => {
  const [rangeWeeks, setRangeWeeks] = useState(10);
  const [xAxisData, setXAxisData] = useState<string[]>([]);
  const [seriesData, setSeriesData] = useState<SeriesData[]>([]);

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

    const tardyData = GenerateBxByWeek(
      "Tardy",
      rangeWeeks,
      safePunishmentResponse
    ).map((week) => week);
    const horseplayData = GenerateBxByWeek(
      "Horseplay",
      rangeWeeks,
      safePunishmentResponse
    ).map((week) => week);
    const dressCodeData = GenerateBxByWeek(
      "Dress Code",
      rangeWeeks,
      safePunishmentResponse
    ).map((week) => week);
    const unauthorizedDeviceData = GenerateBxByWeek(
      "Unauthorized Device/Cell Phone",
      rangeWeeks,
      safePunishmentResponse
    ).map((week) => week);
    const disruptiveBehaviorData = GenerateBxByWeek(
      "Disruptive Behavior",
      rangeWeeks,
      safePunishmentResponse
    ).map((week) => week);
    const positiveData = GenerateBxByWeek(
      "Positive Behavior Shout Out!",
      rangeWeeks,
      safePunishmentResponse
    ).map((week) => week);
    const behavioralConcernData = GenerateBxByWeek(
      "Behavioral Concern",
      rangeWeeks,
      safePunishmentResponse
    ).map((week) => week);
    const officeReferralData = GenerateBxByWeek(
      "Office Referral",
      rangeWeeks,
      safeOfficeReferrals
    ).map((week) => week);
    const inappropriateLanguageData = GenerateBxByWeek(
      "Inappropriate Language",
      rangeWeeks,
      safePunishmentResponse
    ).map((week) => week);

    // Calculate Teacher Managed Referrals as the sum of selected infractions
    const teacherManagedReferrals = tardyData.map(
      (_, index) =>
        (tardyData[index] || 0) +
        (horseplayData[index] || 0) +
        (dressCodeData[index] || 0) +
        (unauthorizedDeviceData[index] || 0) +
        (disruptiveBehaviorData[index] || 0) +
        (inappropriateLanguageData[index] || 0)
    );

    // X-axis: week date ranges
    const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]); // Extract the week date ranges
    setXAxisData(xAxisData); // Y-axis: Generate data for each series based on the same rangeWeeks

    // Set the series data
    setSeriesData([
      {
        name: "Positive Shout Out!",
        type: "line",
        data: positiveData,
        itemStyle: {
          color: "#008000",
        },
      },
      {
        name: "Behavioral Concern",
        type: "line",
        data: behavioralConcernData,
        itemStyle: {
          color: "#FFFF00",
        },
      },
      {
        name: "Teacher Managed",
        type: "line",
        data: teacherManagedReferrals,
        itemStyle: {
          color: "#ffA500",
        },
      },
      {
        name: "Office Managed",
        type: "line",
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
    toolbox: null,
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
    <div
      style={{
        width: "100%", // Makes the chart fit the container's width
        height: "calc(50vh - 20px)", // Set a fixed height or use a percentage value (e.g., "50%")
        overflow: "auto", // Prevents overflow of the chart
      }}
    >
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
    </div>
  );
};
