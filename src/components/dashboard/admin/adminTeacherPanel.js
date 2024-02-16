import react, {useState,useEffect,useRef} from 'react'
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper,Card, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from "axios"
import { baseUrl } from '../../../utils/jsonData'
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import jsPDF from 'jspdf';
import 'jspdf-autotable';



import { IncidentByStudentPieChart } from './widget/incident-by-student-pie-chart';
import IncidentsByStudentTable from '../teacher/teacherPanels/incidentsByStudentTable';
import { get } from '../../../utils/api/api';

   const AdminTeacherPanel = () => {
	const [data, setData]= useState([])
  const [teacherProfileModal,setTeacherProfileModal] = useState(false)
  const [teacherProfileData, setTeacherProfileData] = useState([])
  const [activeTeacher, setActiveTeacher] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);



    
    

    useEffect(() => {
      const fetchEmployeeData = async ()=>{
        try{
          const result = await get('employees/v1/employees/TEACHER')
          setData(result)
        }catch(err){
          console.error('Error Fetching Data: ',err)
        } 
     
      }

      fetchEmployeeData();
    
    },[])







//Fetch Teacher Data 
  const fetchTeacherData = async (teacherEmail)=>{
    try{
      const result = await get('punish/v1/punishments/')
      const newData = result.filter(((x)=> x.teacherEmail === teacherEmail));
      console.log("find me ", newData)
      setTeacherProfileData(newData);
      setTeacherProfileModal(true);  
  
  
    }catch(err){
      console.error('Error Fetching Data: ',err)
    } 
 
  }

const handleSearchChange = (e) => {
  setSearchQuery(e.target.value);
};

useEffect(() => {
  // Filter the data based on the search query
  const filteredRecords = data.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();

    return fullName.includes(searchQuery.toLowerCase());
  });
  setFilteredData(filteredRecords);
}, [data, searchQuery]);
  

const handleProfileClick = (x) =>{
  setActiveTeacher(x)
  fetchTeacherData(x.email)
  setTeacherProfileModal(true)
}

const pdfRef = useRef();

const generatePDF = (activeTeacher,studentData) => {
  const pdf = new jsPDF();
    // Add logo
    const logoWidth = 50; // Adjust the width of the logo as needed
    const logoHeight = 50; // Adjust the height of the logo as needed
    const logoX = 130; // Adjust the X coordinate of the logo as needed
    const logoY = 15; // Adjust the Y coordinate of the logo as needed
    
//https://medium.com/dont-leave-me-out-in-the-code/5-steps-to-create-a-pdf-in-react-using-jspdf-1af182b56cee
//Resource for adding image and how pdf text works
    var image = new Image();
    image.src = "/burke-logo.png";
    pdf.addImage(image, 'PNG', logoX,logoY , logoWidth, logoHeight);

  // Add student details section
  pdf.setFontSize(12)
  pdf.rect(15,15,180,50)
  pdf.text(`${activeTeacher.firstName} ${activeTeacher.lastName}`, 20, 20);
  pdf.text(`Email: ${activeTeacher.email}`, 20, 30);
  // pdf.text(`Phone: ${studentData[0].student.studentPhoneNumber}`, 20, 40);
  // pdf.text(`Grade: ${studentData[0].student.grade}`, 20, 50);
  // pdf.text(`Address: ${studentData[0].student.address}`, 20, 60);

  // Add punishment details table
  pdf.autoTable({
    startY: 70, // Adjust the Y-coordinate as needed
    head: [['Status', 'Description', 'Date', 'Infraction']],
    body: studentData.map((student) => [
      student.status,
      student.infraction.infractionDescription,
      student.timeCreated,
      student.infraction.infractionName,
    ]),
  });

  // Save or open the PDF
  pdf.save('teacher_report.pdf');
};


    const hasScroll = data.length > 10;
    return (
        <>
          {(teacherProfileModal && teacherProfileData) && (


<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
}} className="modal-overlay">
  <div style={{
    height: '95vh',
    width: '95vw',
    position: 'relative',
    backgroundColor: 'white',  // Adjust background color as needed
    padding: '5px',          // Adjust padding as needed
    borderRadius: '8px',      // Add border radius as needed
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',  // Add box shadow as needed
  }} className="modal-content">
      <div style={{height:"290px"}}className='modal-header'>
        <div style={{display:"flex", flexDirection:"row"}}>
            <div className='box-left'>
                <div>
                <h4 style={{ textAlign: "left" }}>{activeTeacher.firstName} {activeTeacher.lastName}</h4>
                  </div>
                  <div style={{ textAlign: "left" }}>Email: {activeTeacher.email}</div>
                <div>
       
            </div>
            </div>
            <div  className='box-center'>
            <IncidentsByStudentTable writeUps={teacherProfileData}/>

            </div>
            <div className='box-right'>
                              <IncidentByStudentPieChart writeUps={teacherProfileData}/>



</div>
{/* 
            <div style={{  width: "100px", height: "100px", marginLeft: "auto" }} className='box-right'>
        <AccountBoxIcon sx={{ fontSize: 100 }}/>
            </div> */}
      
      </div>
      </div>

{data ? 
    <div style={{height:"300px"}}className='modal-body-student'>
  <TableContainer style={{height:"250px",backgroundColor:"white" }}>
    <Table stickyHeader>
    <TableHead>
      <TableRow>
        <TableCell style={{ width: "25%" }}>
          Status
        </TableCell>
        <TableCell style={{ width: "25%" }}>
          Description
        </TableCell>
        <TableCell style={{ width: "25%" }}>
          Date
        </TableCell>
        <TableCell style={{ width: "25%" }}>
          Infraction
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody >
      {teacherProfileData.map((teacher, index) => (
        <TableRow style={{ background: index % 2 === 0 ? "lightgrey" : "white" }} key={index}>
          <TableCell style={{ width: "25%" }}>
            {teacher.status}
          </TableCell>
          <TableCell style={{ width: "25%" }}>
            {teacher.infraction.infractionDescription}
          </TableCell>
          <TableCell style={{ width: "25%" }}>
            {teacher.timeCreated}
          </TableCell>
          <TableCell style={{ width: "25%" }}>
            {teacher.infraction.infractionName}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
    </Table>
  </TableContainer>
</div>
: <div>No Data available</div>}


      <div  className='modal-buttons-teacher-profile'>
        <button onClick={() => { setTeacherProfileModal(false) }}>Close</button>
        <button onClick={()=>{generatePDF(activeTeacher,teacherProfileData)}}style={{backgroundColor:"#CF9FFF"}} >Print</button>

      </div>
    </div>
  </div>
)}
         <div style={{backgroundColor:"rgb(25, 118, 210)",marginTop:"10px", marginBlock:"5px"}}>
   <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
"5px"}}>
   Teachers
        </Typography>
        </div>
   
        <TableContainer component={Paper} style={{ maxHeight: hasScroll ? '720px' : 'auto', overflowY: hasScroll ? 'scroll' : 'visible' }}>
      <Table>
        <TableHead>
        <TableRow>
        <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
      />
        </TableRow>
          <TableRow>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
              Name
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Email
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
              Role
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>


{console.log(data)}

          {filteredData.length > 0 ? (
            filteredData.map((x, key) => (
<TableRow key={key} onClick={() => {handleProfileClick(x)}}>
  <TableCell>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <AccountCircleIcon
        style={{
          fontSize: '2rem',  // Adjust the size as needed
          color: 'rgb(25, 118, 210)', // Change the color to blue
        }}
      />
      <span>{x.firstName} {x.lastName}</span>
    </div>
  </TableCell>
  <TableCell>{x.email}</TableCell>
  <TableCell>{String(x.roles.map(x=>x.role))}</TableCell>

</TableRow>

            ))
          ) : (
            <TableRow>
              <TableCell colSpan="5">No open Data found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
   
    </TableContainer>


    </>
    )
    }


    export default AdminTeacherPanel;

