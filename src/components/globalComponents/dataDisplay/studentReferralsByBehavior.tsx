import ReactEcharts from "echarts-for-react";
import {
  extractDataByWeek,
  getCurrentWeekOfYear,
  getFirstDayOfWeek,
  findDataByWeekAndByPunishment,
} from "../../../helperFunctions/helperFunctions";
import { useState } from "react";
import { StudentPunishment, TeacherReferral } from "src/types/responses";

const StudentReferralsByWeek: React.FC<StudentPunishment> = ({ data = [] }) => {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  // Adjust the week number if current week extends prior to this year
  const yearAdj = (cw: number) => {
    return cw > 0 ? cw : 52 + cw;
  };

  const GenerateChartData = (currentWeek: number, rangeWeeks: number, data: TeacherReferral[]) => {
    const genData = [];

    for (let i = 0; i < rangeWeeks; i++) {
      const weekKey = yearAdj(currentWeek - i);
      const weekData = extractDataByWeek(weekKey, data).length;

      const startDate = getFirstDayOfWeek(weekKey);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const label = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;

      genData.push({
        [label]: weekData,
      });
    }

    return genData;
  };

  const displayDate = GenerateChartData(currentWeek, rangeWeeks, (data as TeacherReferral[]));
  displayDate.reverse();

  const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]);
  const seriesData = displayDate.map((obj) => Object.values(obj)[0] || 0);

  const GenerateBxByWeek = (bx: string, numOfWeeks: number, data: TeacherReferral[]) => {
    const bxData = [];
    for (let i = 0; i < numOfWeeks; i++) {
      const weekNum = yearAdj(currentWeek - i);
      const dataForWeek = findDataByWeekAndByPunishment(weekNum, bx, data);
      bxData.push(dataForWeek);
    }
    return bxData;
  };

  const tardyData = GenerateBxByWeek(
    "Tardy",
    rangeWeeks,
    data as TeacherReferral[]
  );
  const horseplayData = GenerateBxByWeek(
    "Horseplay",
    rangeWeeks,
    data as TeacherReferral[]
  );
  const dressCodeData = GenerateBxByWeek(
    "Dress Code",
    rangeWeeks,
    data as TeacherReferral[]
  );
  const unauthorizedDeviceData = GenerateBxByWeek(
    "Unauthorized Device/Cell Phone",
    rangeWeeks,
    data as TeacherReferral[]
  );
  const disruptiveBehaviorData = GenerateBxByWeek(
    "Disruptive Behavior",
    rangeWeeks,
    data as TeacherReferral[]
  );
  const positiveData = GenerateBxByWeek(
    "Positive Shout Out!",
    rangeWeeks,
    data as TeacherReferral[]
  );
  const behavioralConcernData = GenerateBxByWeek(
    "Behavioral Concern",
    rangeWeeks,
    data as TeacherReferral[]
  );

  const option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: [
        "Tardy",
        "Horseplay",
        "Positive Shout Out!",
        "Dress Code",
        "Behavioral Concern",
        "Disruptive Behavior",
        "Unauthorized Device/Cell Phone",
      ],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxisData,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Tardy",
        type: "line",
        stack: "Total",
        data: tardyData,
      },
      {
        name: "Dress Code",
        type: "line",
        stack: "Total",
        data: dressCodeData,
      },
      {
        name: "Disruptive Behavior",
        type: "line",
        stack: "Total",
        data: disruptiveBehaviorData,
      },
      {
        name: "Behavioral Concern",
        type: "line",
        stack: "Total",
        data: behavioralConcernData,
      },
      {
        name: "Positive Shout Out!",
        type: "line",
        stack: "Total",
        data: positiveData,
      },
      {
        name: "Horseplay",
        type: "line",
        stack: "Total",
        data: horseplayData,
      },
      {
        name: "Unauthorized Device/Cell Phone",
        type: "line",
        stack: "Total",
        data: unauthorizedDeviceData,
      },
    ],
  };

  return (
    <div>
      <ReactEcharts option={option} />
    </div>
  );
};

export default StudentReferralsByWeek;
