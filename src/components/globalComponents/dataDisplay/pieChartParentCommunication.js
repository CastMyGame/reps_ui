import ReactEcharts from "echarts-for-react";
import {
  extractDataByWeek,
  findDataByWeekAndByPunishment,
  currentWeek,
} from "../../../helperFunctions/helperFunctions";

export const PieChartParentCommunication = ({
  data = [],
  shoutOutsResponse = [],
  officeReferrals = [],
  writeUpResponse = [],
}) => {

  const numShoutout = extractDataByWeek(currentWeek, shoutOutsResponse);
  const numOfficeReferral = extractDataByWeek(currentWeek, officeReferrals);
  const numBxConcern = findDataByWeekAndByPunishment(
    currentWeek,
    "Behavioral Concern",
    data
  );

  const teachReferrals = extractDataByWeek(currentWeek, writeUpResponse);

  const option = {
    responsive: true,
    maintainAspectRatio: false,
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
        bottom: "5%",
        label: {
          show: false,
        },
        radius: "90%",
        data: [
          {
            value: numBxConcern,
            name: "Behavioral Concern",
          },
          {
            value: numShoutout.length,
            name: "Positive Behavior Shout Out!",
          },
          {
            value: numOfficeReferral.length,
            name: "Office Referrals",
          },
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
    <div>
      <ReactEcharts option={option} />
    </div>
  );
};
