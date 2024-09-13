import React from "react";
import ReactEcharts from "echarts-for-react";
import "./CustomPieChart.css";
import {
  AdminOverviewDto,
  OfficeReferral,
  TeacherDto,
} from "src/types/responses";

export const AdminSchoolReferralByTypePieChart: React.FC<AdminOverviewDto> = ({
  punishmentResponse = [],
  writeUpResponse = [],
  shoutOutsResponse = [],
  officeReferrals = [],
}) => {
  console.log("Punishment Response ", punishmentResponse);
  console.log("Office Referrals ", officeReferrals);
  let uniqueInfractions: Record<string, number> = {};
  const totalIncidents = (punishmentResponse as TeacherDto[]).length;

  // Get Unique Students Info
  (punishmentResponse as TeacherDto[]).forEach((item) => {
    const infractionType = item.infractionName;
    uniqueInfractions[infractionType] =
      (uniqueInfractions[infractionType] || 0) + 1;
  });

  const behavioralConcerns = Object.entries(uniqueInfractions).map(
    ([uniqueName, incidents]) => {
      let theOne = (punishmentResponse as TeacherDto[]).find(
        (item) => item.infractionName === "Behavioral Concern"
      );

      const infractionName = theOne?.infractionName || "Unknown";

      return {
        uniqueName,
        infractionName,
        incidents: Number(incidents),
      };
    }
  );

  const positives = Object.entries(uniqueInfractions).map(
    ([uniqueName, incidents]) => {
      let theOne = (punishmentResponse as TeacherDto[]).find(
        (item) => item.infractionName === "Positive Behavior Shout Out!"
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

  // Aggregate total incidents for "Positive Behavior Shout Out!"
  const totalPositives = (punishmentResponse as TeacherDto[]).reduce(
    (acc, item) => {
      if (item.infractionName === "Positive Behavior Shout Out!") {
        // Assuming each entry represents 1 incident
        return acc + 1;
      }
      return acc;
    },
    0
  );

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
        left: "30%",
        label: {
          show: false,
        },
        radius: "87%",
        data: [
          //   ...infractionsWithIncidentsList.map((student) => ({
          //     value: student.incidents,
          //     name: `${student.infractionName}`,
          //   })),
          {
            value: behavioralConcerns.length,
            name: "Behavioral Concern",
          },
          {
            value: (shoutOutsResponse as TeacherDto[]).length,
            name: "Positive Behavior Shout Out!",
          },
          {
            value: (officeReferrals as OfficeReferral[]).length,
            name: "Office Referrals",
          },
          {
            value: (writeUpResponse as TeacherDto[]).length,
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
