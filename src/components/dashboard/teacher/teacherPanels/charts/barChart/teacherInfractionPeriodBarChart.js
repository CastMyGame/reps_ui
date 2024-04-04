import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import Typography from '@mui/material/Typography';
import { axisClasses } from '@mui/x-charts';
import { getIncidentByBehavior } from '../../../../global/helperFunctions';


const TeacherInfractionOverPeriodBarChart = ({data = []}) => {

const chartSetting = {
  yAxis: [
    {
  
    },
  ],

  width: 500,
  height: 290,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: 'translate(-20px, 0)',
      
    },
  },
};

const dataset = [
  {
    incidents: getIncidentByBehavior("Tardy",data),
    behavior: 'Tardy'
  },
  {
    incidents: getIncidentByBehavior("Disruptive Behavior",data),
    behavior: 'Dis. Behavior',
  },
  {
    incidents: getIncidentByBehavior("Horseplay",data),
    behavior: 'Horseplay',
  },
  {
    incidents: getIncidentByBehavior("Dress Code",data),
    behavior: 'Dress Code',
  },
  {
    incidents: getIncidentByBehavior("Unauthorized Device/Cell Phone",data),
    behavior: 'Device',
  },
  {
    incidents: getIncidentByBehavior("Behavioral Concern",data),
    behavior: 'B. Concern',
  },
  {
    incidents: getIncidentByBehavior("Failure to Complete Work",data),
    behavior: 'FTC',
  },
  
];

  return (
    <div>
      <Typography  marginLeft={"25%"} marginTop={"10px"} style={{ fontSize: '2rem'}}>
        Referral Overview
      </Typography>
      <BarChart
        dataset={dataset}
        xAxis={[{ scaleType: 'band', dataKey: 'behavior', categoryGapRatio: 0.2 }]}
        series={[{ dataKey: 'incidents', label: 'Referrals', fontSize: '1.25rem' }]}
        {...chartSetting}
      />
    </div>
  );
};

export default TeacherInfractionOverPeriodBarChart;
