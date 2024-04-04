import { Typography } from "@mui/material"
import React from "react"
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { filterPunishementsByLoggedInUser, getIncidentByBehavior } from "../../../../global/helperFunctions";

export const PieChartParentCommunication = ({data = []}) =>{


    const numShoutout = getIncidentByBehavior("Positive Behavior Shout Out!",data)
    const numBxConcern = getIncidentByBehavior("Behavioral Concern",data)


const teachReferrals = filterPunishementsByLoggedInUser(data);



    return(
        <>
         <Typography style={{ fontSize: '2rem'}}>Parent Communcation</Typography>
    <PieChart
      series={[
      
        { data: [
          { id: 0, value: numBxConcern, label: 'Behavioral' },
          { id: 1, value: numShoutout, label: 'Shout Out' },
          { id: 2, value: teachReferrals, label: 'Referrals' },
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
          fontSize: '2rem'
        },
      }}
   
    
    />
        </>
    )
   



    
}