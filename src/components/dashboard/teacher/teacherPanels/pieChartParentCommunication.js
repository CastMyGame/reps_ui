import { Typography } from "@mui/material"
import React from "react"
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { getIncidentByBehavior } from "../../global/helperFunctions";

export const PieChartParentCommunication = ({data = []}) =>{


    const numShoutout = getIncidentByBehavior("Positive Behavior Shout Out!",data)
    const numBxConcern = getIncidentByBehavior("Behavioral Concern",data)
    const infractionNamesToMatch = ["Tardy","Unauthorized Device/Cell Phone", "Disruptive Behavior", "Horseplay", "Dress Code","Failure to Complete Work"];

const numReferrals = data.filter(record => infractionNamesToMatch.includes(record.infraction.infractionName)).length;

    return(
        <>
         <Typography>Parent Communcation</Typography>
    <PieChart
      series={[
      
        
        { data: [
          { id: 0, value: numBxConcern, label: 'Behavioral' },
          { id: 1, value: numShoutout, label: 'ShoutOut' },
          { id: 2, value: numReferrals, label: 'Referals' },
        ],
          arcLabel: (item) =>  `(${item.value})`,
          arcLabelMinAngle: 45,
          
        },
      ]}
      width={500}
      height={260}
      
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fill: 'white',
          fontWeight: 'bold',
        },
      }}
   
    
    />
        </>
    )
   



    
}