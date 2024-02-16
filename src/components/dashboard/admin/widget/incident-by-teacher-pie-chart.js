import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

export const IncidentByTeacherPieChart = ({ data = [], teacherData=[] }) => {

//grab total indcidents
const totalIncidents = data.length;


//Grab teachers and extract emails
const teachersWithIncidentsList = []

teacherData.map((teacher) => {
  console.log(teacher.email)
  const filteredData = data.filter(item => item.teacherEmail === teacher.email);
  if(filteredData.length > 0){
     
teachersWithIncidentsList.push({
  teacherEmail: teacher.email,
  incidents: filteredData.length, // Use the length of filteredData as incidents
  percent: ((filteredData.length / totalIncidents) * 100).toFixed(2),
})
     
}
});

const generateLegendColor = (index) => {
  const colors = ['#02B2AF', '#2E96FF', '#B800D8', '#60009B', '#2731C8', '#03008D'];
  return colors[index % colors.length];
};


// Filter out undefined items before mapping


  return (
    <>
      <Typography style={{justifySelf:"center"}}>Incident By Staff Involved</Typography>
      <div style={{ display: 'flex' }}>

      <PieChart
        series={[
          {
            data: teachersWithIncidentsList.map((teacher, index) => ({
              id: index,
              value: parseFloat(teacher.percent),
              label: `${teacher.teacherEmail.split("@")[0]} (${teacher.incidents})`,
            })),
            arcLabel: (item) => `(${item.value}%)`,
            arcLabelMinAngle: 45,
          },
        ]}
        width={300}
        height={300}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fill: 'white',
            fontWeight: 'bold',
          },
        }}
        slotProps={{ legend: { hidden: true } }}

      />
       {/* Scrollable container for labels */}
       <div className="legend">
      {teachersWithIncidentsList.map((teacher, index) => (
        <div key={index} className="legend-item">
          <div className={`legend-color legend-color-${index + 1}`} style={{ backgroundColor: generateLegendColor(index) }}></div>
          <span>{`${teacher.teacherEmail.split("@")[0]} (${teacher.incidents})`}</span>
        </div>
      ))}
    </div>
      </div>
    </>
  );
};
