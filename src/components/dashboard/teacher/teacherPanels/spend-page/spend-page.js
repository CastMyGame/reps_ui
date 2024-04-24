import react, {useState,useEffect} from 'react'
import * as React from 'react';
import { baseUrl } from '../../../../../utils/jsonData'
import "./spend-page.css"
import { Button, MenuItem, Select, TextField } from '@mui/material';
import axios from 'axios';




   const SpendPage = () => {
    const [shoppingList,setShoppingList] = useState([])
    const [description,setDescription] = useState();
    const [amount,setAmount] = useState();
    const [listOfStudents, setListOfStudents] = useState([]);
    const [studentSelect, setStudentSelect] = useState(null);
    const [studentPoints, setStudentPoints] = useState(null);






//Gets Stduents


const url = `${baseUrl}/student/v1/allStudents`; // Replace with your actual API endpoint

const headers = {
  Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
};

//Get list Of Students
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

const selectOptions = listOfStudents.map((student) => ({
  value: student.studentEmail, // Use a unique value for each option
  label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
}));

//Grab Select Student Info to Get Points
useEffect(() => {
  if(studentSelect !==null){
    console.log(studentSelect,"studentselect")
    const selectStudentUrl = `${baseUrl}/student/v1/email/${studentSelect}`; // Replace with your actual API endpoint
    axios
      .get(selectStudentUrl, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setStudentPoints(response.data.points);
        console.log(response.data)
      })
      .catch(function (error) {
        console.error(error);
      });
  

  }
}, [headers, studentSelect]);

//calculate shopping list points


//Submit Post 
const handleSubmit = () => {
  // Calculate the total points
  const totalPoints = shoppingList.reduce((accu, curr) => {
    return accu + Number(curr.amount);
  }, 0);


  // Send the POST request with the requestData object
  axios
  .post(`${baseUrl}/student/v1/points/delete?studentEmail=${studentSelect}&points=${totalPoints}`, null, {
    headers: headers,
  })
  .then(function (res) {
    window.alert("Points Have Been Redeemed");
  })
  .catch(function (error) {
    window.alert("Error Redeeming Points");
  });
}




    const addToCart = (amount,description) =>{
      if(amount && description){
        setShoppingList((prev)=>([...prev,{amount:Number(amount),description:description}]))
        setDescription("")
        setAmount("")
      }else{
        alert('Please enter both amount and description.');

      }

    }
;
    
    return (
        <div className='panel-container'>
          <div className='form'>

       
          <h1 className='title'>Point Redemption</h1>
          <div className='divider'></div>
          <h2 className='center'>Select Student</h2>
          <Select
          required
          fullWidth
          variant="outlined"
          value={studentSelect}
          onChange={(event) => setStudentSelect(event.target.value)}
          label="Select Student"
        >
          {selectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

<h3 className='center'>Avaiable Points</h3>
<div className={`spend-points-container ${studentPoints ? 'spin' : ''}`}>
  {studentPoints ? studentPoints: ""}</div>

{studentSelect && <div className='redemption-input-box'>
<h3 className='center'>Redemption</h3>
<div className='input-box-combo'>
<TextField
                  required
                  type="number"
                  id="redemptionAmount"
                  label="Redemption Amount"
                  name="redpemptionAmount"
                  value={amount}
                  onChange={(event) => {
                    const enteredValue = event.target.value;
                    setAmount(enteredValue);
                  }}  
                  inputProps={{
                    style: {
                      fontSize: "1.5rem", // Font size for the input
                      fontWeight:"bold",
                      backgroundColor:"white",
                      marginRight:"2px",
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      fontSize: "1.5rem",
                      
                   
                    }     

                    }}
                           />
          <TextField
                  required
                  fullWidth
                  type="text"
                  id="redemptionDescription"
                  label="Description "
                  name="redemptionDescription"
                  value={description}
                  onChange={(event) => {
                    const enteredValue = event.target.value;
                    setDescription(enteredValue);
                  }}                  inputProps={{
                    style: {
                      fontSize: "1.5rem", // Font size for the input
                      fontWeight:"bold",
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      fontSize: "1.5rem",
                   
                    }     

                    }}
                           />





</div>
              <Button
                  onClick={()=>addToCart(amount,description)}
                  width="50%"
                  variant="contained"
                  sx={{ height: "100%", marginTop:"10px" }} // Set explicit height
                >
                  Add
                </Button>

                <table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    {shoppingList.map((item, index) => (
      <tr key={index}>
        <td>{item.description}</td>
        <td>${item.amount}</td>
      </tr>
    ))}
  </tbody>
</table>
<div className='total-box'>
<div className='total-title'>Total</div>
<div className='total-amount'>${shoppingList.reduce((accu,curr)=>{
  return accu + Number(curr.amount)
},0)}</div>
</div>

<Button
               type="submit"
               onClick={()=>handleSubmit()}
                  // color="success"
                  width="100%"
                  variant=""
                  sx={{ height: "100%", width:"100%", marginTop:"10px" }} // Set explicit height
                >
                  Submit
                </Button>
           
          
</div>}
         


  







                </div>

   </div>
    )
    }


    export default SpendPage;


