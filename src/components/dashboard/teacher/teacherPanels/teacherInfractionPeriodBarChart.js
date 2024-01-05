import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import Typography from '@mui/material/Typography';
import { axisClasses } from '@mui/x-charts';
import { getIncidentByBehavior } from '../../global/helperFunctions';


const TeacherInfractionOverPeriodBarChart = ({data = []}) => {

const chartSetting = {
  yAxis: [
    {
  
    },
  ],

  width: 900,
  height: 260,
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
    behavior: 'Unauthorized Device',
  },
  {
    incidents: getIncidentByBehavior("Behavioral Concern",data),
    behavior: 'Bx Concern',
  },
  {
    incidents: getIncidentByBehavior("Failure to Complete Work",data),
    behavior: 'FTC',
  },
  
];

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Incidents Overview
      </Typography>
      <BarChart
        dataset={dataset}
        xAxis={[{ scaleType: 'band', dataKey: 'behavior' }]}
        series={[{ dataKey: 'incidents', label: 'incidents' }]}
        {...chartSetting}
      />
    </div>
  );
};

export default TeacherInfractionOverPeriodBarChart;
