import ReactEcharts from "echarts-for-react";
import {
  OfficeReferral,
  TeacherDto,
  TeacherOverviewDto,
} from "src/types/responses";
import {
  countLast7Days,
  isDateInLast7Days,
} from "../../../helperFunctions/helperFunctions";

interface PieChartParentCommunicationProps {
  data: TeacherOverviewDto;
  shoutOutsResponse: TeacherDto[];
  officeReferrals: OfficeReferral[];
  writeUpResponse: TeacherDto[];
}

export const PieChartParentCommunication: React.FC<
  PieChartParentCommunicationProps
> = ({
  data = {},
  shoutOutsResponse = [],
  officeReferrals = [],
  writeUpResponse = [],
}) => {

  const numShoutout = countLast7Days(shoutOutsResponse || []);
  const numOfficeReferral = countLast7Days(officeReferrals || []);
  const teachReferrals = countLast7Days(writeUpResponse || []);
  const numBxConcern = countLast7Days(
    data?.punishmentResponse || [],
    (item) => item.infractionName === "Behavioral Concern"
  );

  // Check if there's no data to display
  const hasData =
    numShoutout > 0 ||
    numOfficeReferral > 0 ||
    numBxConcern > 0 ||
    teachReferrals > 0;

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
            value: numShoutout,
            name: "Positive Behavior Shout Out!",
            itemStyle: {
              color: "#008000",
            },
          },
          {
            value: numBxConcern,
            name: "Behavioral Concern",
            itemStyle: {
              color: "#FFFF00",
            },
          },
          {
            value: teachReferrals,
            name: "Teacher Referrals",
            itemStyle: {
              color: "#ffA500",
            },
          },
          {
            value: numOfficeReferral,
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

  const fallbackOption = {
    title: {
      text: "No Referral Data This Week",
      left: "center",
    },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: "65%",
        data: [
          { value: 0, itemStyle: { color: "#ccc" } },
        ],
      },
    ],
  };

  return (
    <div>
        <ReactEcharts option={hasData ? option : fallbackOption} />
    </div>
  );
};
