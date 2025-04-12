import ReactEcharts from "echarts-for-react";
import { TeacherDto } from "src/types/responses";

interface TeacherReferralByWeekProps {
  punishmentResponse: TeacherDto[];
}

const TeacherManagedReferralByLevelByWeek: React.FC<
  TeacherReferralByWeekProps
> = ({ punishmentResponse = [] }) => {
  // Helper function to filter data by referral level
  const filterByLevel = (data: TeacherDto[], level: string) => {
    return data.filter((item) => item.infractionLevel === level);
  };

  // Validate and sanitize punishmentResponse
  const safePunishmentResponse = Array.isArray(punishmentResponse)
    ? punishmentResponse
    : [];

  // Generate series data for each level
  const level1Data = filterByLevel(safePunishmentResponse, "1");
  const level2Data = filterByLevel(safePunishmentResponse, "2");
  const level3Data = filterByLevel(safePunishmentResponse, "3");
  const level4Data = filterByLevel(safePunishmentResponse, "4");

  const option = {
    responsive: true,
    maintainAspectRatio: false,
    tooltip: {
      trigger: "item",
    },
    legend: {
      show: true,
      orient: "horizontal",
      top: "top",
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
      boundaryGap: true,
      show: false,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Level 1",
        type: "bar",
        data: [level1Data.length],
        itemStyle: {
          color: "#008000",
        },
      },
      {
        name: "Level 2",
        type: "bar",
        data: [level2Data.length],
        itemStyle: {
          color: "#FFFF00",
        },
      },
      {
        name: "Level 3",
        type: "bar",
        data: [level3Data.length],
        itemStyle: {
          color: "#ffA500",
        },
      },
      {
        name: "Level 4",
        type: "bar",
        data: [level4Data.length],
        itemStyle: {
          color: "#ff0000",
        },
      },
    ],
  };

  return (
    <div style={{ height: "calc(50vh - 20px)", width: "100%", overflow: "auto" }}>
      <ReactEcharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
};

export default TeacherManagedReferralByLevelByWeek;
