import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import '../../../../admin/widget/CustomPieChart.css'
import { get } from "../../../../../../utils/api/api";

export const IncidentByTypePieChart = ({ data = [] }) => {

  const [writeUps,setWriteUps] = useState([])

  
  useEffect(() => {
    const fetchWriteUps = async () =>{
      try{
        const response = await get(`punish/v1/punishments/${data.studentEmail}`)
        setWriteUps(response)
      }catch(error){
console.error(error)
      }

    }   

    fetchWriteUps();


  }, []);


 
  const tardyList = writeUps.filter(punishment => punishment.infraction.infractionName === "Tardy");
  const disruptiveList = writeUps.filter(punishment => punishment.infraction.infractionName === "Disruptive Behavior");
  const cellList = writeUps.filter(punishment => punishment.infraction.infractionName === "Unauthorized Device/Cell Phone");
  const horseplayList = writeUps.filter(punishment => punishment.infraction.infractionName === "Horseplay");
  const dressCodeList = writeUps.filter(punishment => punishment.infraction.infractionName === "Dress Code");
  const ftcList = writeUps.filter(punishment => punishment.infraction.infractionName === "Failure To Complete Work");

  const refList = [];
  refList.push(tardyList);
  refList.push(disruptiveList);
  refList.push(cellList);
  refList.push(horseplayList);
  refList.push(dressCodeList);
  refList.push(ftcList);

const total = tardyList.length + disruptiveList.length + cellList.length + horseplayList.length+dressCodeList.length +ftcList.length;
  
  const listReturn = [{
     id: 0, value: total> 0 ? ((tardyList.length/total)*100).toFixed(0): 0, label: 'Tardy'
    },
    {
      id: 1, value: total> 0 ?((disruptiveList.length/total)*100).toFixed(0) : 0, label: 'Disruptive Behavior'
     },
     {
      id: 2, value:total> 0 ? ((cellList.length/total)*100).toFixed(0) : 0, label: 'Cell Phone'
     },
     {
      id: 3, value: total> 0 ?((horseplayList.length/total)*100).toFixed(0) : 0, label: 'Horseplay'
     },
     {
      id: 4, value: total> 0 ?((dressCodeList.length/total)*100).toFixed(0) : 0, label: 'Dress Code'
     },
     {
      id: 5, value: total> 0 ?((ftcList.length/total)*100).toFixed(0) : 0, label: 'Failure to Complete Work'
     },
  ];
  console.log(refList)
  console.log("TOTAL", total)
  console.log("Trady", tardyList.length)
  console.log("FTC", ftcList.length)
  console.log("distrupt", disruptiveList.length)
  console.log("cellphone", cellList.length)
  console.log("horseplay", horseplayList.length)
  console.log("dresscode", dressCodeList.length)


  // Custom styles for the scrollable container
  const scrollableContainerStyle = {
    maxHeight: '200px',
    overflowY: 'auto',
    paddingRight: '10px', // Adjust as needed to make room for the scrollbar
  };

  const generateLegendColor = (index) => {
    const colors = ['#02B2AF', '#2E96FF', '#B800D8', '#60009B', '#2731C8', '#03008D'];
    return colors[index % colors.length];
  };

  return (
    <>
      <Typography>Incident By Student (Week)</Typography>
      <div style={{ display: 'flex' }}>
        <PieChart
          series={[
            {
              data: listReturn,
              arcLabel: (item) => `(${item.value}%)`,
              arcLabelMinAngle: 45,
            },
          ]}
         
          width={350}
          height={250}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: 'white',
              fontWeight: 'bold',
            },
          }}
          // Use slotProps.legend instead of legend prop
          slotProps={{ legend: { hidden: true } }}
          // slotProps={{
          //   legend:{

          //     vertical:'middle',horizontal:"right"}}}
          />
        {/* Scrollable container for labels */}
        <div className="legend">
      {listReturn.map((punishment, index) => (
        <div key={index} className="legend-item">
          <div className={`legend-color legend-color-${index + 1}`} style={{ backgroundColor: generateLegendColor(index) }}></div>
          <span>{`${punishment.label}`}</span>
        </div>
      ))}
    </div>
      </div>
    </>
  );
};