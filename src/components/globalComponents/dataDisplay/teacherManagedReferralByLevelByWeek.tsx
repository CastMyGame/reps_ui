import ReactEcharts from "echarts-for-react";
import {
  extractDataByWeek,
  getCurrentWeekOfYear,
  getFirstDayOfWeek,
} from "../../../helperFunctions/helperFunctions";
import { useState } from "react";
import {
  AdminOverviewDto,
  TeacherDto,
} from "src/types/responses";

const TeacherManagedReferralByLevelByWeek: React.FC<AdminOverviewDto> = ({
  punishmentResponse = [],
}) => {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  const yearAdj = (cw: number): number => {
    if (cw > 0) return cw;
    if (cw <= 0) {
      return 52 + cw;
    }
    return 1; // Fallback to week 1 in case of unexpected input
  };

  // Helper function to filter data by referral level
  const filterByLevel = (data: TeacherDto[], level: string) => {
    return data.filter((item) => item.infractionLevel === level);
  };

  // Generate labels for xAxis
  const GenerateChartData = (currentWeek: number, rangeWeeks: number) => {
    const genData = [];
    for (let i = 0; i < rangeWeeks; i++) {
      const startDate = getFirstDayOfWeek(yearAdj(currentWeek - i));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const label = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${
        endDate.getMonth() + 1
      }/${endDate.getDate()}`;
      genData.push(label);
    }
    return genData;
  };

  // Validate and sanitize punishmentResponse
  const safePunishmentResponse = Array.isArray(punishmentResponse)
    ? punishmentResponse
    : [];

  // Generate series data for each level
  const level1Data = filterByLevel(safePunishmentResponse as TeacherDto[], "1");
  const level2Data = filterByLevel(safePunishmentResponse as TeacherDto[], "2");
  const level3Data = filterByLevel(safePunishmentResponse as TeacherDto[], "3");
  const level4Data = filterByLevel(safePunishmentResponse as TeacherDto[], "4");

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
    <div style={{ maxHeight: "100%", maxWidth: "100%" }}>
      <ReactEcharts option={option} />
    </div>
  );
};

export default TeacherManagedReferralByLevelByWeek;
