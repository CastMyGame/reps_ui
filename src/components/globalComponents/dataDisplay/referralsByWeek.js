import ReactEcharts from "echarts-for-react";
import {
  extractDataByWeek,
  getCurrentWeekOfYear,
  getFirstDayOfWeek,
  findDataByWeekAndByPunishment,
} from "../../../helperFunctions/helperFunctions";
import { useState } from "react";

export const TotalReferralByWeek = ({
  punishmentResponse = [],
  officeReferrals = [],
}) => {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  //This helps adjust the week number if current week extend prior to this year
  const yearAdj = (cw) => {
    if (cw > 0) return cw;
    if (cw <= 0) {
      return 52 + cw;
    }
  };

  const GenerateBxByWeek = (bx, numOfWeeks, data) => {
    const bxData = [];
    for (let i = 0; i < numOfWeeks; i++) {
      console.log(" teacher data ", data);
      const weekNum = yearAdj(currentWeek - i);
      const dataForWeek = findDataByWeekAndByPunishment(weekNum, bx, data);
      bxData.push(dataForWeek);
    }
    return bxData;
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

  const displayDate = GenerateChartData(
    currentWeek,
    rangeWeeks,
    punishmentResponse
  );

  //This reverses the x axis
  displayDate.reverse();

  // Convert the weekMap to the format suitable for LineChart
  const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]); // Extract the keys (labels)

  const tardyData = GenerateBxByWeek("Tardy", rangeWeeks, punishmentResponse);
  const horseplayData = GenerateBxByWeek(
    "Horseplay",
    rangeWeeks,
    punishmentResponse
  );
  const dressCodeData = GenerateBxByWeek(
    "Dress Code",
    rangeWeeks,
    punishmentResponse
  );
  const unauthorizedDeviceData = GenerateBxByWeek(
    "Unauthorized Device/Cell Phone",
    rangeWeeks,
    punishmentResponse
  );
  const disruptiveBehaviorData = GenerateBxByWeek(
    "Disruptive Behavior",
    rangeWeeks,
    punishmentResponse
  );
  const positiveData = GenerateBxByWeek(
    "Positive Shout Out!",
    rangeWeeks,
    punishmentResponse
  );
  const behavioralConcernData = GenerateBxByWeek(
    "Behavioral Concern",
    rangeWeeks,
    punishmentResponse
  );
  const officeReferralData = GenerateBxByWeek(
    "Office Referral",
    rangeWeeks,
    officeReferrals
  );

  // Calculate Teacher Managed Referrals as the sum of selected infractions
  const teacherManagedReferrals = tardyData.map((_, index) => {
    return (
      tardyData[index] +
      horseplayData[index] +
      dressCodeData[index] +
      unauthorizedDeviceData[index] +
      disruptiveBehaviorData[index]
    );
  });

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
        "Teacher Managed Referrals",
        "Office Managed Referrals",
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
      data: xAxisData,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Behavioral Concern",
        type: "line",
        data: behavioralConcernData,
      },
      {
        name: "Positive Shout Out!",
        type: "line",
        data: positiveData,
      },
      {
        name: "Teacher Managed Referrals",
        type: "line",
        data: teacherManagedReferrals,
      },
      {
        name: "Office Managed Referrals",
        type: "line",
        data: officeReferralData,
      },
    ],
  };

  return (
    <div style={{ maxHeight: "100%", maxWidth: "100%" }}>
      <ReactEcharts option={option} />
    </div>
  );
};
