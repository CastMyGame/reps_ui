import react, {useState,useEffect} from 'react'
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from "axios"
import { baseUrl } from '../../../../utils/jsonData'
import StudentProfile from '../../../StudentProfile';
import IncidentsByStudentTable from './incidentsByStudentTable';
import TotalReferralByWeek from './referralsByWeek';
import TotalStudentReferredByWeek from './numberOfStudentReferralsByWeek';
import Card from '@mui/material/Card';
import ReferralByBehavior from './referralsByBehavior';
import { fetchDataFromApi } from '../../global/helperFunctions';
import TeacherInfractionOverPeriodBarChart from './teacherInfractionPeriodBarChart';
import { PieChartParentCommunication } from './pieChartParentCommunication';
import RecentIncidents from './studentRecentIncidents';
import TeacherShoutOutWidget from './teacherShoutOutWidget.js';
import LevelThreePanel from '../../global/levelThreePanel.js';
import Button from '@mui/material/Button';


   const TeacherOverviewPanel = ({data = []}) => {
	const [listOfStudents, setListOfStudents]= useState([])
  const [studentDisplay, setStudentDisplay] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [openModal, setOpenModal] = useState({display:false,message:"",buttonType:""})
  const [status, setStatus] = useState([])

  const filterPunishmentByStatus = (data) => {
    return data.filter(x => x.status === "PENDING");
  }

  useEffect(() => {
    filterPunishmentByStatus(data)
    if(data.length > 0){
      setOpenModal({display:true, message:"Attention! You have level 3 punishments with student answers that must be reviewed before closing. Please hit the redirect button to go to the level 3 approval page or cancel to continue. You will receive notifications until the answers are reviewed as they are not Closed until you review. Thank you!", buttonType:"redirect"});
    }
  }, [data]);



    return (
        <>
            {console.log(data + "These are the data!")}
    {openModal.display && <div className="modal-overlay">
  <div className="modal-content">
    <div className='modal-header'>
      <h3>{openModal.message}</h3>
    </div>
    <div className='modal-body'>
    </div>
    <div className='modal-buttons'>

      <button onClick={() => {
        setOpenModal({display:false,message:""})}}>Cancel</button>
      {openModal.buttonType==="redirect" && <Button
      type="redirect"
      onClick={() => {
        setOpenModal({display:false,message:""})}}
      width='50%'
      variant="contained"
      sx={{ height: '100%' }} // Set explicit height
    >
      Submit
    </Button>}
   </div>
  </div>
</div>}
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
    <div className='teacher-widget-half'>
      <Card>
    <div style={{ textAlign:"center",marginTop:"10px"}}>
<PieChartParentCommunication data={data}/>


    </div>
    </Card>
    </div>
    <div className='teacher-widget-half'>
      <div className='infraction-bar-chart'>
        <Card>
<TeacherInfractionOverPeriodBarChart data={data}/>
</Card>
      </div>
  


</div>

  </div>

  <div style={{backgroundColor:"rgb(25, 118, 210)",marginTop:"10px", marginBlock:"5px"}}>
   <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
"5px"}}>
  Students of Concern
        </Typography>
        </div>


  <div className='overview-row'>
    <div className='teacher-widget-half'>
<div className='studentIncidentTable'>
<Card style={{padding:"5px"}}>
    <IncidentsByStudentTable data={data}/>
</Card>


</div>

    </div>
    <div className='teacher-widget-half'>
<Card style={{padding:"5px"}}>
<RecentIncidents data={data}/>
</Card>

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


    export default TeacherOverviewPanel;


