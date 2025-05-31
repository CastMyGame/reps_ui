import React, { useMemo } from "react";
import { isDateInLast7Days } from "src/helperFunctions/helperFunctions";
import ReactEcharts from "echarts-for-react";
import { TeacherDto } from "src/types/responses";

interface TeacherInfractionOverPeriodBarChartProps {
  data: TeacherDto[];
}

const TeacherInfractionOverPeriodBarChart: React.FC<
  TeacherInfractionOverPeriodBarChartProps
> = ({ data }) => {
  const counts = useMemo(() => {
    let counts = {
      Tardy: 0,
      "Disruptive Behavior": 0,
      Horseplay: 0,
      "Dress Code": 0,
      "Unauthorized Device/Cell Phone": 0,
      "Behavioral Concern": 0,
      "Failure to Complete Work": 0,
      "Inappropriate Language": 0,
    };

    for (const item of data || []) {
      if (isDateInLast7Days(item.timeCreated)) {
        const type = item.infractionName;
        if (counts.hasOwnProperty(type)) {
          counts[type as keyof typeof counts]++;
        }
      }
    }
    return counts;
  }, [data]);

  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      show: true,
      orient: "horizontal",
      top: "top",
    },
    xAxis: {
      type: "category",
      show: false,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Behavioral Concern",
        type: "bar",
        data: [counts["Behavioral Concern"]],
        itemStyle: {
          color: "#0000FF",
        },
      },
      {
        name: "Disruptive Behavior",
        type: "bar",
        data: [counts["Disruptive Behavior"]],
        itemStyle: {
          color: "#ffA500",
        },
      },
      {
        name: "Dress Code",
        type: "bar",
        data: [counts["Dress Code"]],
        itemStyle: {
          color: "#C7EA46",
        },
      },
      {
        name: "Failure to Complete Work",
        type: "bar",
        data: [counts["Failure to Complete Work"]],
        itemStyle: {
          color: "#000000",
        },
      },
      {
        name: "Horseplay",
        type: "bar",
        data: [counts["Horseplay"]],
        itemStyle: {
          color: "#964B00",
        },
      },
      {
        name: "Inappropriate Language",
        type: "bar",
        data: [counts["Inappropriate Language"]],
        itemStyle: {
          color: "#FFC0CB",
        },
      },
      {
        name: "Tardy",
        type: "bar",
        data: [counts["Tardy"]],
        itemStyle: {
          color: "#800080",
        },
      },
      {
        name: "Unauthorized Device/Cell Phone",
        type: "bar",
        data: [counts["Unauthorized Device/Cell Phone"]],
        itemStyle: {
          color: "#ff0000",
        },
      },
    ],
  };

  return (
    <ReactEcharts style={{ height: "40vh", width: "100%" }} option={option} />
  );
};

export default TeacherInfractionOverPeriodBarChart;
