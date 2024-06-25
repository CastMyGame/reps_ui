import { LineChart } from "@mui/x-charts/LineChart";
import { Typography } from "@mui/material";
import {
  extractDataByWeek,
  extractDataByWeekFirstDay,
  getCurrentWeekOfYear,
  getFirstDayOfWeek,
  getUniqueStudentIdFromList,
} from "../../../helperFunctions/helperFunctions";
import { useState } from "react";

export default function TotalStudentReferredByWeek({ data = [] }) {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  const yearAdj = (cw) => {
    if (cw > 0) return cw;
    if (cw <= 0) {
      return 52 + cw;
    }
  };

  const GenerateChartData = (currentWeek, rangeWeeks, data) => {
    const genData = [];

    for (let i = 0; i < rangeWeeks; i++) {
      const weekKey = `W${yearAdj(currentWeek - i)}`;
      const weekData = extractDataByWeek(yearAdj(currentWeek - i), data).length; // Assuming findDataByWeek and yearAdj are defined elsewhere

      const startDate = getFirstDayOfWeek(yearAdj(currentWeek - i));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Assuming you want to show the end date of the week

      const label = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;

      genData.push({
        [label]: weekData,
      });
    }

    return genData;
  };

  const displayDate = GenerateChartData(currentWeek, rangeWeeks, data);

  //This reverses the x axis
  displayDate.reverse();

  // Convert the weekMap to the format suitable for LineChart
  const xAxisData = displayDate.map((obj) => Object.keys(obj)[0]); // Extract the keys (labels)
  const seriesData = displayDate.map((obj) => Object.values(obj)[0] || 0); // Extract the values associated with the keys

  return (
    data && (
      <>
        <Typography variant="h4" gutterBottom>
          Number of Students Receiving Referrals By Week
        </Typography>{" "}
        <button
          onClick={() => setRangeWeek((prev) => prev - 1)}
          style={{ height: "20px", width: "20px", padding: 0, borderRadius: 0 }}
        >
          -
        </button>{" "}
        <button
          onClick={() => setRangeWeek((prev) => prev + 1)}
          style={{ height: "20px", width: "20px", padding: 0, borderRadius: 0 }}
        >
          +
        </button>
        <LineChart
          xAxis={[
            {
              scaleType: "band",
              data: xAxisData,
              label: "Weeks",
            },
          ]}
          yAxis={[{ label: "Number of Student Referred" }]}
          series={[
            {
              data: seriesData, // Number of punishments
            },
          ]}
          width={400}
          height={250}
        />
      </>
    )
  );
}
