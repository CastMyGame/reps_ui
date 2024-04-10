import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import Typography from "@mui/material/Typography";
import { axisClasses } from "@mui/x-charts";
import { getIncidentByBehavior } from "../../../../global/helperFunctions";

const TeacherInfractionOverPeriodBarChart = ({ data = [] }) => {
  const chartSetting = {
    yAxis: [{}],

    width: 500,
    height: 290,
    sx: {
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: "translate(-20px, 0)",
      },
    },
  };

  const dataset = [
    {
      incidents: getIncidentByBehavior("Tardy", data),
      behavior: "Tardy",
    },
    {
      incidents: getIncidentByBehavior("Disruptive Behavior", data),
      behavior: "Dis. Behavior",
    },
    {
      incidents: getIncidentByBehavior("Horseplay", data),
      behavior: "Horseplay",
    },
    {
      incidents: getIncidentByBehavior("Dress Code", data),
      behavior: "Dress Code",
    },
    {
      incidents: getIncidentByBehavior("Unauthorized Device/Cell Phone", data),
      behavior: "Device",
    },
    {
      incidents: getIncidentByBehavior("Behavioral Concern", data),
      behavior: "B. Concern",
    },
    {
      incidents: getIncidentByBehavior("Failure to Complete Work", data),
      behavior: "FTC",
    },
  ];

  return (
    <div>
      <Typography
        marginLeft={"25%"}
        alignContent={"justify"}
        style={{ fontSize: "2rem" }}
      >
        Referral Overview
      </Typography>
      <BarChart
        dataset={dataset}
        leftAxis={null}
        slotProps={{
          legend: {
            labelStyle: {
              fontSize: "1.5rem",
            },
          },
        }}
        xAxis={[
          {
            scaleType: "band",
            width: 1200,
            dataKey: "behavior",
            categoryGapRatio: 0.0005,
            tickLabelStyle: {
              angle: 25,
              textAnchor: "start",
              fontSize: 12,
            },
          },
        ]}
        series={[{ dataKey: "incidents", label: "Referrals" }]}
        sx={{
          "& .MuiChartsLegend-series text": { fontSize: "1.5rem !important" },
        }}
        {...chartSetting}
      />
    </div>
  );
};

export default TeacherInfractionOverPeriodBarChart;
