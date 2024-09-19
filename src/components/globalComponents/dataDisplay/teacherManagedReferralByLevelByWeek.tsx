import ReactEcharts from "echarts-for-react";
import {
  extractDataByWeek,
  getCurrentWeekOfYear,
  getFirstDayOfWeek,
} from "../../../helperFunctions/helperFunctions";
import { useState } from "react";
import {
  AdminOverviewDto,
  StudentPunishment,
  TeacherDto,
  TeacherReferral,
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

  // Generate chart data for a specific referral level
  const GenerateLevelDataByWeek = (
    level: string,
    currentWeek: number,
    data: TeacherDto[]
  ) => {
    const levelData = [];
    const filteredData = filterByLevel(data, level);
    levelData.push(filteredData.length); // Count of referrals for this level in the given week
    return levelData;
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

  // Generate xAxis data (weeks)
  const xAxisData = GenerateChartData(currentWeek, rangeWeeks);

  // Generate series data for each level
  const level1Data = filterByLevel(punishmentResponse as TeacherDto[], "1");
  const level2Data = filterByLevel(punishmentResponse as TeacherDto[], "2");
  const level3Data = filterByLevel(punishmentResponse as TeacherDto[], "3");
  const level4Data = filterByLevel(punishmentResponse as TeacherDto[], "4");

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
      },
      {
        name: "Level 2",
        type: "bar",
        data: [level2Data.length],
      },
      {
        name: "Level 3",
        type: "bar",
        data: [level3Data.length],
      },
      {
        name: "Level 4",
        type: "bar",
        data: [level4Data.length],
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
