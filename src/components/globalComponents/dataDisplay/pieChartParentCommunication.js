import ReactEcharts from "echarts-for-react";
import { useState } from "react";
import {
  extractDataByWeek,
  filterPunishementsByLoggedInUser,
  findDataByWeekAndByPunishment,
  getIncidentByBehavior,
  getFirstDayOfWeek,
  getCurrentWeekOfYear,
} from "../../../helperFunctions/helperFunctions";

export const PieChartParentCommunication = ({
  data = [],
  shoutOutsResponse = [],
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
  const numShoutout = extractDataByWeek(currentWeek, shoutOutsResponse);
  const numBxConcern = findDataByWeekAndByPunishment(
    currentWeek,
    "Behavioral Concern",
    data
  );

  const teachReferrals = extractDataByWeek(currentWeek, data);

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

  const option = {
    responsive: true,
    maintainAspectRatio: false,
    // title: {
    //   text: "All School Referrals by Type",
    //   left: "center",
    // },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      align: "auto",
      left: "left",
      top: "10%",
    },
    series: [
      {
        type: "pie",
        stillShowZeroSum: false,
        left: "20%",
        label: {
          show: false,
        },
        radius: "95%",
        data: [
          {
            value: numBxConcern,
            name: "Behavioral Concern",
          },
          {
            value: numShoutout.length,
            name: "Positive Behavior Shout Out!",
          },
          // {
          //   value: (officeReferrals).length,
          //   name: "Office Referrals",
          // },
          {
            value: teachReferrals.length,
            name: "Teacher Referrals",
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return (
    <div style={{ maxHeight: "100%", maxWidth: "100%" }}>
      <ReactEcharts option={option} />
    </div>
  );
};
