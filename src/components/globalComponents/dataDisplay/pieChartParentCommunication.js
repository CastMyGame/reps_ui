import ReactEcharts from "echarts-for-react";
import {
  extractDataByWeek,
  findDataByWeekAndByPunishment,
  currentWeek,
} from "../../../helperFunctions/helperFunctions";

export const PieChartParentCommunication = ({
  data = {},
  shoutOutsResponse = [],
  officeReferrals = [],
  writeUpResponse = [],
}) => {
  const numShoutout = extractDataByWeek(currentWeek, shoutOutsResponse || []);
  const numOfficeReferral = extractDataByWeek(
    currentWeek,
    officeReferrals || []
  );
  const numBxConcern = findDataByWeekAndByPunishment(
    currentWeek,
    "Behavioral Concern",
    data || []
  );

  const teachReferrals = extractDataByWeek(currentWeek, writeUpResponse || []);

  // Check if there's no data to display
  const hasData =
    numShoutout.length ||
    numOfficeReferral.length ||
    numBxConcern ||
    teachReferrals.length;

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
        bottom: "15%",
        label: {
          show: false,
        },
        radius: "90%",
        data: [
          {
            value: numShoutout.length,
            name: "Positive Behavior Shout Out!",
            itemStyle: {
              color: "#008000",
            },
          },
          {
            value: numBxConcern.length,
            name: "Behavioral Concern",
            itemStyle: {
              color: "#FFFF00",
            },
          },
          {
            value: teachReferrals.length,
            name: "Teacher Referrals",
            itemStyle: {
              color: "#ffA500",
            },
          },
          {
            value: numOfficeReferral.length,
            name: "Office Referrals",
            itemStyle: {
              color: "#ff0000",
            },
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
      {hasData ? (
        <ReactEcharts option={option} />
      ) : (
        <ReactEcharts option={[]} />
      )}
    </div>
  );
};
