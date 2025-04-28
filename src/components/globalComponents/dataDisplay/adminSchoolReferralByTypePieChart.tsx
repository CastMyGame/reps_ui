import React from "react";
import ReactEcharts from "echarts-for-react";
import "./CustomPieChart.css";
import { OfficeReferral, TeacherDto } from "src/types/responses";
import { countLast7Days } from "src/helperFunctions/helperFunctions";

interface AdminReferralByTypeProps {
  punishmentResponse: TeacherDto[];
  writeUpResponse: TeacherDto[];
  shoutOutsResponse: TeacherDto[];
  officeReferrals: OfficeReferral[];
}

export const AdminSchoolReferralByTypePieChart: React.FC<
  AdminReferralByTypeProps
> = ({
  punishmentResponse,
  writeUpResponse,
  shoutOutsResponse,
  officeReferrals,
}) => {
  const behavioralConcerns = countLast7Days(
    punishmentResponse || [],
    (item) => item.infractionName === "Behavioral Concern"
  );
  const shoutOutWeek = countLast7Days(shoutOutsResponse || []);
  const officeReferralWeek = countLast7Days(officeReferrals || []);
  const teacherReferralWeek = countLast7Days(writeUpResponse || []);

  // Check if there's no data to display
  const hasData =
    shoutOutWeek > 0 ||
    officeReferralWeek > 0 ||
    behavioralConcerns > 0 ||
    teacherReferralWeek > 0;

  const option = {
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
        radius: "70%",
        data: [
          {
            value: shoutOutWeek,
            name: "Positive Behavior Shout Out!",
            itemStyle: {
              color: "#008000",
            },
          },
          {
            value: behavioralConcerns,
            name: "Behavioral Concern",
            itemStyle: {
              color: "#FFFF00",
            },
          },
          {
            value: teacherReferralWeek,
            name: "Teacher Referrals",
            itemStyle: {
              color: "#ffA500",
            },
          },
          {
            value: officeReferralWeek,
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
        data: [{ value: 0, itemStyle: { color: "#ccc" } }],
      },
    ],
  };

  return (
    <ReactEcharts
      style={{ height: "40vh", width: "100%" }}
      option={hasData ? option : fallbackOption}
    />
  );
};
