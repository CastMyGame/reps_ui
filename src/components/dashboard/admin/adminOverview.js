import react, {useState,useEffect} from 'react'
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import TotalReferralByWeek from '../teacher/teacherPanels/referralsByWeek';
import TotalStudentReferredByWeek from '../teacher/teacherPanels/numberOfStudentReferralsByWeek';
import ReferralByBehavior from '../teacher/teacherPanels/referralsByBehavior';
import IncidentsByStudentTable from '../teacher/teacherPanels/incidentsByStudentTable';
import TeacherInfractionOverPeriodBarChart from '../teacher/teacherPanels/teacherInfractionPeriodBarChart';
import { IncidentByTeacherPieChart } from './widget/incident-by-teacher-pie-chart';
import {  Top5TeacherRatioTable } from './widget/top-5-ratio-table';
import { WorseClassTable } from './widget/top-class-with-write-up';
import { IncidentByStudentPieChart } from './widget/incident-by-student-pie-chart';
import TeacherShoutOutWidget from '../teacher/teacherPanels/teacherShoutOutWidget';

   const AdminOverviewPanel = ({data = []}) => {


  const dataExcludeNonReferrals = data.filter((x)=>{return (x.infraction.infractionName !=="Positive Behavior Shout Out!" && x.infraction.infractionName !=="Behavioral Concerns")})
  const weeklyData = dataExcludeNonReferrals.filter((x) => {
     const currentDate = new Date();
     const itemDate = new Date(x.timeCreated);
     const sevenDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 7));
     return itemDate > sevenDaysAgo;
 });

 const weeklyDataIncSOBxConcern = data.filter((x) => {
    const currentDate = new Date();
    const itemDate = new Date(x.timeCreated);
    const sevenDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 7));
    return itemDate > sevenDaysAgo;
});


    return (
        <>
                        <div className='teacher-overview-first'>
        <Card variant="outlined">
        <TeacherShoutOutWidget data={data}/>
        </Card>
        </div>
         <div style={{backgroundColor:"rgb(25, 118, 210)",marginTop:"10px", marginBlock:"5px"}}>
   <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
"5px"}}>
   Week At a Glance
        </Typography>
        </div>


  <div className='overview-row'>
    <div className='teacher-widget-third'>
      {/* <Card> */}
    <div style={{ textAlign:"center",marginTop:"10px"}}>
<IncidentByStudentPieChart data={weeklyData}/>


    </div>
    {/* </Card> */}
    </div>
    <div className='teacher-widget-third'>
      <div style={{overflowY:"auto",height:"100%"}} className='infraction-bar-chart'>
        {/* <Card> */}
<IncidentsByStudentTable data={weeklyData}/>
{/* </Card> */}
      </div>
  


</div>

<div className='teacher-widget-third'>
{/* <div style={{overflowY:"auto",height:"100%"}} className='infraction-bar-chart'> */}
        {/* <Card> */}
<TeacherInfractionOverPeriodBarChart data={weeklyDataIncSOBxConcern}/>
{/* </Card> */}
      {/* </div> */}
  


</div>

  </div>

  <div style={{backgroundColor:"rgb(25, 118, 210)",marginTop:"10px", marginBlock:"5px"}}>
   <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
"5px"}}>
  Coaching Information
        </Typography>
        </div>


  <div className='overview-row'>
    <div className='teacher-widget-third'>
    <div  className='infraction-bar-chart'>
<Card style={{padding:"5px"}}>
    <IncidentByTeacherPieChart data={data}/>
</Card>


</div>

    </div>
    <div className='teacher-widget-third'>
    <div  className='infraction-bar-chart'>
<Card style={{padding:"5px"}}>
    <Top5TeacherRatioTable data={data}/>
</Card>
</div>
    </div>

    <div className='teacher-widget-third'>
    <div className='infraction-bar-chart'>
<Card style={{padding:"5px"}}>
<WorseClassTable data={data}/>
</Card>

</div>

  </div>
  </div>

  <div style={{backgroundColor:"rgb(25, 118, 210)",marginTop:"10px", marginBlock:"5px"}}>
   <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
"5px"}}>
  Longitudinal Reports
        </Typography>
        </div>


  <div className='overview-row'>
    <div className='teacher-widget-third'>

    <Card style={{padding:"5px"}}>

      <TotalReferralByWeek data={data}/>

      </Card>



    </div>
    <div className='teacher-widget-third'>
    <Card style={{padding:"5px"}}>
<TotalStudentReferredByWeek data={data}/>
</Card>
</div>

<div className='teacher-widget-third'>
<Card style={{padding:"5px"}}>
<ReferralByBehavior data={data}/>
</Card>

</div>

  </div>

  
    </>
    )
    }


    export default AdminOverviewPanel;


