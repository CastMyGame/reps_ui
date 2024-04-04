import { LineChart } from '@mui/x-charts/LineChart';
import { Typography } from '@mui/material';
import { findDataByWeekAndByPunishment, getCurrentWeekOfYear, getFirstDayOfWeek } from '../../../../global/helperFunctions';
import { useState } from 'react';

export default function ReferralByBehavior({ data = [] }) {
  const [rangeWeeks, setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

  const yearAdj = (cw) => {
    if (cw > 0)
      return (cw)
    if (cw <= 0) {
      return 52 + cw;
    }
  }

  const GenerateBxByWeek = (bx, numOfWeeks, data) => {
    const bxData = [];
    for (let i = 0; i < numOfWeeks; i++) {
      const weekNum = yearAdj(currentWeek - i);
      const dataForWeek = findDataByWeekAndByPunishment(weekNum, bx, data)
      bxData.push(dataForWeek)

    }
    return bxData;
  }

  const tardyData = GenerateBxByWeek("Tardy", rangeWeeks, data);
  const horseplayData = GenerateBxByWeek("Horseplay", rangeWeeks, data);
  const dressCodeData = GenerateBxByWeek("Dress Code", rangeWeeks, data);
  const unauthorizedDevice = GenerateBxByWeek("Unauthorized Device/Cell Phone", rangeWeeks, data);

  const GenerateLabels = (rangeWeeks, currentWeek) => {
    const labels = [];
    for (let i = 0; i < rangeWeeks; i++) {
      const weekNum = yearAdj(currentWeek - i);
      const startDate = getFirstDayOfWeek(weekNum);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const label = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
      labels.push(label);
    }
    return labels.reverse();
  }

  const xLabels = GenerateLabels(rangeWeeks, currentWeek);

  return (
    data && (<>
      <Typography variant="h4" gutterBottom>
        Behavior Trends
      </Typography>
      <button onClick={() => setRangeWeek((prev) => prev - 1)} style={{ height: "20px", width: "20px", padding: 0, borderRadius: 0 }}>-</button>
      <button onClick={() => setRangeWeek((prev) => prev + 1)} style={{ height: "20px", width: "20px", padding: 0, borderRadius: 0 }}>+</button>
      <LineChart
        width={550}
        height={250}
        series={[
          { data: tardyData.reverse(), label: 'Tardy' },
          { data: dressCodeData.reverse(), label: 'Dress Code' },
          { data: horseplayData.reverse(), label: 'Horseplay' },
          { data: unauthorizedDevice.reverse(), label: 'Unauthorized Device' },
        ]}
        xAxis={[{ scaleType: 'point', data: xLabels }]}
      />
    </>)
  );
}
