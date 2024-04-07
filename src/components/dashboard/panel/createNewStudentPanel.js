import React from 'react'
import { useState,useEffect } from 'react';
import Typography from '@mui/material/Typography';
import axios from "axios";
import Select from "react-select";
import { baseUrl } from '../../../utils/jsonData';

import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import Container from '@mui/material/Container';


const CreateNewStudentPanel = () => {
   

    const [errorDisplay, setErrorDisplay] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successDisplay, setSuccessDisplay] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [listOfStudents, setListOfStudents] = useState([]);
  
const [studentForm, setStudentForm] = useState(	{
  firstName: "",
  lastName: "",
  parentEmail: "",
  studentEmail: "",
  guidanceEmail: "",
  adminEmail: "",
  address: "",
  grade: "",
  parentPhoneNumber: "",
  studentPhoneNumber: ""
})
  
  
    // const tardyDescription = "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."
    // const cellPhoneDescription = "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."
    // const disruptiveBehavioralDescription = "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."
    // const HorseplayDescription = "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."
    // const failureToCompleteWorkDescription = "Provide a brief description of the missing assignment (Name of assignment in Powerschool, link to the assignment if possible, the impact it is having on the students grade and the possible points they can regain upon completion.)"
    // const dressCodeDescription = "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."
    // const positiveBehaviorDescription = "Needs Text"
    // const failureToCompleteWorkTitle = "Failure to complete Work"
    // const otherTitle = "For all offenses other than positive behavior shout out and failure to complete work."
    // const behaviorShoutTitle = "Shout Comment"
  
    const defaultTheme = createTheme();

    
    const studentGradeLevelOptions =[
      {value:"8", label:"Grade 8"},
      {value:"9", label:"Grade 9"},
      {value:"10", label:"Grade 10"},
      {value:"11", label:"Grade 11"},
      {value:"12", label:"Grade 12"},
      

    ]

  

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    
    const url = `${baseUrl}/student/v1/allStudents`; // Replace with your actual API endpoint
    
    useEffect(() => {
      axios
        .get(url, { headers }) // Pass the headers option with the JWT token
        .then(function (response) {
          setListOfStudents(response.data);
        })
        .catch(function (error) {
          console.error(error);
        });
    }, []);
  
      const selectOptions = listOfStudents.map(student => ({
          value: student.studentEmail, // Use a unique value for each option
          label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
    
          
        }));
      


  
        const resetForm = ()=>{
          setStudentForm(	{
            firstName: "",
            lastName: "",
            parentEmail: "",
            studentEmail: "",
            guidanceEmail: "",
            adminEmail: "",
            address: "",
            grade: "",
            parentPhoneNumber: "",
            studentPhoneNumber: ""
          })
       
      
      }
      

      const handleSubmit = (event) => {
        event.preventDefault();

             axios.post(`${baseUrl}/student/v1/newStudent`,studentForm,
               {headers: headers})
              .then(function (res){
               setSuccessDisplay(true)
               setSuccessMessage("Student Add")
               setTimeout(()=>{
                   setSuccessDisplay(false)
               },3000)
               resetForm();
           })
.catch(function (error){
               console.error(error);
               const errorMessage = error.response.status === 500 ? "Bad Request": "Other Error";
               setErrorDisplay(true)
               setErrorMessage(errorMessage)
               setTimeout(()=>{
                   setErrorDisplay(false)
               },2000)
           });
    
      
  
      
    }



    return (
        <>
         <div style={{backgroundColor:"rgb(25, 118, 210)",marginTop:"10px", marginBlock:"5px"}}>
          <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
"5px"}}>
   Add Student to Record
        </Typography>
        </div>

        <div className="page-container">
      <div className="lrKTG">
        <div className="form-container">
            <div className="M7eMe">Create New Student</div>
    
            <div className="md0UAd" aria-hidden="true" dir="auto">
              * Indicates required question
            </div>
            {successDisplay && <span style={{background:"green"}}> {successMessage}</span>}
            {errorDisplay && <span style={{background:"pink"}}> {errorMessage}</span>}
            


            <ThemeProvider theme={defaultTheme}>
      <Container component="main" >

        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width:"100%"
          }}
        >
        
          <Typography component="h1" variant="h5">
           Create New Punishment
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          
       
            <label htmlFor="selectStudent">Select Student *</label>
             
      
              
              <TextField
              margin="normal"
              required
              fullWidth
              onChange={(event) => {
                const enteredValue = event.target.value;
                setStudentForm((prev) => ({
                  ...prev,
                  firstName: enteredValue, // Replace "newFirstName" with the actual value you want to set
                }));
              }}             
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="firstName"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
    
            />

<TextField
              margin="normal"
              required
              fullWidth
              onChange={(event) => {
                const enteredValue = event.target.value;
                setStudentForm((prev) => ({
                  ...prev,
                  lastName: enteredValue, 
                }));
              }}             
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="lastName"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
    
            />

<TextField
              margin="normal"
              required
              fullWidth
              onChange={(event) => {
                const enteredValue = event.target.value;
                setStudentForm((prev) => ({
                  ...prev,
                  guidanceEmail: enteredValue, 
                }));
              }}             
              id="guidanceEmail"
              label="Guidance Email"
              name="guidanceEmail"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
    
            />


<TextField
              margin="normal"
              required
              fullWidth
              onChange={(event) => {
                const enteredValue = event.target.value;
                setStudentForm((prev) => ({
                  ...prev,
                  parentEmail: enteredValue, 
                }));
              }}             
              id="parentEmail"
              label="Parent Email"
              name="parentEmail"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
    
            />

<TextField
              margin="normal"
              required
              fullWidth
              onChange={(event) => {
                const enteredValue = event.target.value;
                setStudentForm((prev) => ({
                  ...prev,
                  studentEmail: enteredValue, 
                }));
              }}             
              id="studentEmail"
              label="Student Email"
              name="studentEmail"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
    
            />

<TextField
              margin="normal"
              required
              fullWidth
              onChange={(event) => {
                const enteredValue = event.target.value;
                setStudentForm((prev) => ({
                  ...prev,
                  adminEmail: enteredValue, 
                }));
              }}             
              id="adminEmail"
              label="Admin Email"
              name="adminEmail"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
    
            />

<TextField
              margin="normal"
              required
              fullWidth
              onChange={(event) => {
                const enteredValue = event.target.value;
                setStudentForm((prev) => ({
                  ...prev,
                  address: enteredValue, 
                }));
              }}             
              id="address"
              label="Address"
              name="address"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
    
            />


<Select
                name="studentGrade"
                options={studentGradeLevelOptions}
                placeholder="Grade"
                value={studentForm.grade}
                onChange={(value)=>setStudentForm((prev)=>({
                  ...prev,
                  grade: value["value"]
                }))}
                isSearchable={true}
  
              />
              

  


              <TextField
              margin="normal"
              required
              fullWidth
              onChange={(event) => {
                const enteredValue = event.target.value;
                setStudentForm((prev) => ({
                  ...prev,
                  parentPhoneNumber: enteredValue, 
                }));
              }}             
              id="parentPhone"
              label="Parent Phone"
              name="parentPhone"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
    
            />

<TextField
              margin="normal"
              required
              fullWidth
              onChange={(event) => {
                const enteredValue = event.target.value;
                setStudentForm((prev) => ({
                  ...prev,
                  studentPhoneNumber: enteredValue, 
                }));
              }}             
              id="studentPhone"
              label="Student Phone"
              name="studentPhone"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
    
            />

            <br/>



          <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
           Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
   </div>
    </div>
    </div>
  
    </>
    )
    
  }
  export default CreateNewStudentPanel;