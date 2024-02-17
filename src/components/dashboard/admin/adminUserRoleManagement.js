import react, {useState,useEffect} from 'react'
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, Select } from '@mui/material';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ContactsIcon from '@mui/icons-material/Contacts';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from "axios"
import { baseUrl } from '../../../utils/jsonData'
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';

import AddTeacherForm from './addTeacherForm';

   const AdminUserRoleManagement = () => {


	const [listOfStudents, setListOfStudents]= useState([])
  const [studentDisplay, setStudentDisplay] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [addTeacherDisplay,setAddTeacherDisplay] = useState(true);
  const [isAddTeacherModalOpen, setAddTeacherModalOpen] = useState(false);

const [approveUpdate, setApproveUpdate] = useState("false");

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    const roleOptions =[
      {value:"TEACHER", label:"TEACHER"},
      {value:"STUDENT", label:"STUDENT"},
      {value:"ADMIN", label:"ADMIN"},
      {value:"CHOOSE ROLE", label:"CHOOSE ROLE"},

    ]
    
    const url = `${baseUrl}/users/v1/users`;
    

    useEffect(() => {
    
          axios
              .get(url, { headers })
              .then(function (response) {
                  setListOfStudents(response.data);
              })
              .catch(function (error) {
                  console.log(error);
              });
    
  }, [approveUpdate]); // Run useEffect whenever approveUpdate changes


    const updateUserRole = (id,role) =>{
      const url = `${baseUrl}/users/v1/users/${id}/roles`;
      const payload = [
        {
            id: "",
            role:role
          }]

  axios
  .put(url,payload, { headers }) // Pass the headers option with the JWT token
  .then(function (response) {
    console.log(response.data);
    setApproveUpdate((prev)=>!prev)
    console.log(approveUpdate)
    window.alert("You have updated user")
  })
  .catch(function (error) {
    console.log(error);
  });



    }

    const deleteUser = (user) =>{
      const url = `${baseUrl}/users/v1/users/${user.id}`;
  

  axios
  .delete(url, { headers }) // Pass the headers option with the JWT token
  .then(function (response) {
    console.log(response.data);
    setApproveUpdate((prev)=>!prev)
    window.alert(`You have Deleted User: ${user.firstName} ${user.lastName}`)
  })
  .catch(function (error) {
    console.log(error);
  });

    }



      const data = listOfStudents
  


    const hasScroll = data.length > 10;
    return (
        <div style={{height:"inherit"}}>
          {isAddTeacherModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <AddTeacherForm setAddTeacherModalOpen={setAddTeacherModalOpen} />
      <button onClick={() => setAddTeacherModalOpen(false)}>Close</button>
    </div>
  </div>
)}
         <div style={{backgroundColor:"rgb(25, 118, 210)",marginTop:"15px", marginBlock:"5px"}}>
   <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
"5px"}}>
   Role Management
        </Typography>
        </div>
   
<button onClick={()=> setAddTeacherModalOpen(true)}>Add Employee/Student</button>
    <TableContainer component={Paper} style={{ maxHeight: hasScroll ? '720px' : 'auto', overflowY: hasScroll ? 'scroll' : 'visible' }}>
      <Table>
        <TableHead>
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
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
              Phone Number
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Actions
            </TableCell>
         
          </TableRow>
        </TableHead>
        <TableBody>


{console.log(data)}

          {data.length > 0 ? (
            data.map((x, key) => (
<TableRow key={key} onClick={() => {setStudentDisplay(true); setStudentEmail(x.studentEmail); setStudentName(x.firstName);}}>
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
  <TableCell>{x.username}</TableCell>
  <TableCell>
<TableCell>
<Select
  name="selectStudent"
  placeholder="Select Role"
  value={x.roles && x.roles.length > 0 ? x.roles[0].role : 'CHOOSE ROLE'}
  onChange={(event) => {

    const selectedRoleId = event.target.value;  // This will give you the selected role value
    console.log(`Student ID: ${x.id}, Selected Role ID: ${selectedRoleId}`);
    updateUserRole(x.id,selectedRoleId)
  }}
  style={{ minWidth: '150px' }} // Adjust width if necessary
>
  {roleOptions.map((role, index) => (
    <MenuItem key={index} value={role.value}>
      {role.label}
    </MenuItem>
  ))}
</Select>


</TableCell>

         


</TableCell>  
<TableCell>555-555-5555</TableCell>
  <TableCell>

      <DeleteIcon onClick={()=>deleteUser(x)} color="error" /> 


  </TableCell>
</TableRow>

            ))
          ) : (
            <TableRow>
              <TableCell colSpan="5">No open assignments found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

    </div>
    )
    }


    export default AdminUserRoleManagement;


