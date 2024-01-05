import { LineChart } from '@mui/x-charts/LineChart';
import { Typography } from '@mui/material';
import { extractDataByWeek, getCurrentWeekOfYear } from '../../global/helperFunctions';
import { useState } from 'react';

export default function TotalReferalByWeek({data = []}) {
  const [rangeWeeks,setRangeWeek] = useState(10);
  const currentWeek = getCurrentWeekOfYear();

//This helps adjust the week number if current week extend prior to this year
const yearAdj = (cw) =>{
  if(cw>0)
  return(cw)
if(cw <=0){
  return 52 + cw;
}
}



const GenerateChartData = (currentWeek, rangeWeeks,data) => {
  const genData = [];
  
  for (let i = 0; i < rangeWeeks; i++) {
    const weekKey = `W${yearAdj(currentWeek-i)}`;
    const weekData = extractDataByWeek(yearAdj(currentWeek-i),data).length; // Assuming findDataByWeek and yearAdj are defined elsewhere
    
    genData.push({
      [weekKey]: weekData
    });
  }

  return genData;
};


console.log(data)
const displayDate = GenerateChartData(currentWeek,rangeWeeks,data)

console.log(displayDate)
//This reverses the x axis
displayDate.reverse()




// Convert the weekMap to the format suitable for LineChart
const xAxisData = displayDate.map(obj => Object.keys(obj)[0]); // Extract the keys (labels)
const seriesData = displayDate.map(obj => Object.values(obj)[0] || 0); // Extract the values associated with the keys

  return (
     data && (<>
      <Typography variant="h6" gutterBottom>
       Number of Referrals By Week
      </Typography> <button onClick={()=>setRangeWeek((prev)=> prev-1)} style={{height:"20px", width:"20px",padding:0,borderRadius:0}}>-</button> <button onClick={()=>setRangeWeek((prev)=> prev+1)} style={{height:"20px", width:"20px",padding:0, borderRadius:0}}>+</button> 
      <LineChart
        xAxis={[{ 
          scaleType:'band', data: xAxisData, label:"Weeks"
       }]}

       yAxis={[ {label:"Number of Incidents"}
      ]}
        
        series={[
          {
            data: seriesData, // Number of punishments
          },
        ]}
        width={400}
        height={200}
      />
    </>) 
  );
}
