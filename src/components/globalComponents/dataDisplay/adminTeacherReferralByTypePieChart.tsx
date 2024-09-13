import React from "react";
import ReactEcharts from "echarts-for-react";
import "./CustomPieChart.css";
import { AdminOverviewDto, TeacherDto } from "src/types/responses";

export const AdminTeacherReferralByTypePieChart: React.FC<AdminOverviewDto> = ({
  writeUpResponse = [],
}) => {
  let uniqueInfractions: Record<string, number> = {};
  const totalIncidents = (writeUpResponse as TeacherDto[]).length;

  // Get Unique Students Info
  (writeUpResponse as TeacherDto[]).forEach((item) => {
    const infractionType = item.infractionName;
    uniqueInfractions[infractionType] =
      (uniqueInfractions[infractionType] || 0) + 1;
  });

  const infractionsWithIncidentsList = Object.entries(uniqueInfractions).map(
    ([uniqueName, incidents]) => {
      let theOne = (writeUpResponse as TeacherDto[]).find(
        (item) => item.infractionName === uniqueName
      );

      const infractionName = theOne?.infractionName || "Unknown";

      return {
        uniqueName,
        infractionName,
        incidents: Number(incidents),
      };
    }
  );

  //   const meetsThreshold = studentsWithIncidentsList
  //     .filter((ind) => parseFloat(ind.percent) > 8.0)
  //     .sort((a, b) => b.incidents - a.incidents);

  const option = {
    responsive: true,
    maintainAspectRatio: false,
    // title: {
    //   text: "Teacher Managed Referrals by Type",
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
        left: "30%",
        label: {
          show: false,
        },
        radius: "87%",
        data: [
          ...infractionsWithIncidentsList.map((student) => ({
            value: student.incidents,
            name: `${student.infractionName}`,
          })),
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
