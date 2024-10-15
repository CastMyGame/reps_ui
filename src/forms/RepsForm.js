import React, { useEffect, useState } from 'react';
import axios from "axios";
import Select from "react-select";
import { baseUrl } from '../utils/jsonData';


function MyForm() {
    const[teacherEmail,setTeacherEmail]= useState("");
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [infraction, setInfraction] = useState('');
  const [offenseDescription,setOffenseDescription] = useState({});
  const [infractionPeriod, setInfractionPeriod] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successDisplay, setSuccessDisplay] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [listOfStudents, setListOfStudents] = useState([]);



  const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

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
  // const concernTitle = "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."
  const [selectedOptions, setSelectedOptions] = useState();


  const resetForm = () => {
    setTeacherEmail("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setInfraction("");
    setOffenseDescription({});
    setInfractionPeriod("");
    setSelectedOptions("")
  };
  
  
  const descriptions = {
    "Failure to Complete Work": "Please write a description of the missing assignment, when it was due, and a link to the assignment if one is available. Please also explain how the missing assignment is effecting the student's grade and how many points they can earn upon completion.",
    "Positive Behavior Shout Out!": "Thank you for choosing to shout out a successful student! Please write a description of the action that earned a shout out along with the student's name and anyone else who was involved.",
  };

  const titles = {
    "Failure to Complete Work": "Failure to Complete Work",
    "Positive Behavior Shout Out!": "Positive Behavior Shout Out! ",
  };


  const getDescription = (selectedOption) =>{
    return descriptions[selectedOption] ||  "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."

  }

  const getTitle = (selectedOption) =>{
    return titles[selectedOption] ||  "For all offenses other than positive behavior shout out and failure to complete work."
  }


  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    
    const url = `${baseUrl}/student/v1/allStudents`; // Replace with your actual API endpoint
    
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
        firstName: student.firstName,
        lastName: student.lastName
        
      }));
    
      // Handle the selection change

    function findStudentByEmail(email) {
        const foundStudent = listOfStudents.find(student => student.studentEmail === email);
        return foundStudent || null; // Returns the found student or null if not found
      }

    function handleSelect(data) {
    setSelectedOptions(data);
    setFirstName(data.firstName);
    setLastName(data.lastName)
    setEmail(data.value)
      }


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailPattern.test(email)) {
        setErrorDisplay(true);
        setErrorMessage('Please enter a valid email address');
        return; // Do not proceed with submission
      }

    const foundStudent = findStudentByEmail(email);

    if(foundStudent){
        var payload = {
            "firstName" :firstName ,
            "lastName": lastName,
            "studentEmail": email,
            "infractionName": infraction,
            "infractionPeriod":infractionPeriod ,
            "infractionDescription" : offenseDescription,
            "teacherEmail": teacherEmail
            }

            const headers = {
              Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
            };
            
          
            axios.post(`${baseUrl}/punish/v1/startPunish/formList`,payload,
             {headers: headers}

            )
            .then(function (res){
             setSuccessDisplay(true)
             setSuccessMessage(res.status === 202 ? "Punishment Created":"error")
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

    }else{
        setErrorDisplay(true)
        setErrorMessage("Student Not Found in System")
        setTimeout(()=>{
            setErrorDisplay(false)
        },2000)

    }
 
  };

  const handleAnswer = (value) => {
    setOffenseDescription((offenseDescription) => [...offenseDescription, value]);
  }

  return (
    <div className="page-container">
      <div className="lrKTG">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="M7eMe">REPS Teacher Managed Referral</div>
             <h5> This form will be used to provide automated assignments based on the behavior described in this form. The offense number will be looked up automatically and will include offenses from other class. A list of the offenses and their assignments can be viewed{' '}
 After completing this form, the student and their guardian will be informed of the incident and given a restorative assignment to complete to gain insight on the negative effects of the behavior. REPS Discipline Management System will also send follow-up emails if additional steps are needed. These emails are designed to be copied and pasted directly into Review 360 when necessary. </h5>
   
            <div className="md0UAd" aria-hidden="true" dir="auto">
              * Indicates required question
            </div>
            {successDisplay && <span style={{background:"green"}}> {successMessage}</span>}
            {errorDisplay && <span style={{background:"pink"}}> {errorMessage}</span>}
            
            <div className='question-container'>
            <label htmlFor="selectStudent">Select Student *</label>
                <Select
                name="selectStudent"
                options={selectOptions}
                placeholder="Select Student"
                value={selectedOptions}
                onChange={handleSelect}
                isSearchable={true}/>
            </div>
            
            <div className='question-container'>
              <label htmlFor="teacherEmail">Teacher's Email *</label>
              <input
                type="text"
                id="teacherEmail"
                name="teacherEmail"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                required
              />
            </div>
                   <div className='question-container'>
              <label htmlFor="infractionPeriod">Class Period *</label>
              <select
                id="infractionPeriod"
                name="infractionPeriod"
                value={infractionPeriod}
                onChange={(e) => setInfractionPeriod(e.target.value)}
                required
              >
                <option value="">Choose</option>
                <option value="Block 1">Block 1</option>
                <option value="Block 2">Block 2</option>
                <option value="Block 3">Block 3</option>
                <option value="Block 4">Block 4</option>
                <option value="Period 1">Period 1</option>
                <option value="Period 2">Period 2</option>
                <option value="Period 3">Period 3</option>
                <option value="Period 4">Period 4</option>
                <option value="Period 5">Period 5</option>
                <option value="Period 6">Period 6</option>
                <option value="Period 7">Period 7</option>
                <option value="Period 8">Period 8</option>
                <option value="Period 9">Period 9</option>
              </select>
            </div>
            <div className='question-container'>
              <label htmlFor="infraction">Name of the Infraction or Positive Behavior Shout Out *</label>
              <select
                id="infraction"
                name="infraction"
                value={infraction}
                onChange={(e) => setInfraction(e.target.value)}
                required
              >
                <option value="">Choose</option>
                <option value="Tardy">Tardy</option>
                <option value="Unauthorized Device/Cell Phone">Unauthorized Device/Cell Phone</option>
                <option value="Disruptive Behavior">Disruptive Behavior</option>
                <option value="Horseplay">Horseplay</option>
                <option value="Failure to Complete Work">Failure to Complete Work</option>
                <option value="Dress Code">Dress Code</option>
                <option value="Positive Behavior Shout Out!">Positive Behavior Shout Out!</option>
                <option value="Behavioral Concern">Behavioral Concern</option>
              </select>
            </div>
     

            <div className='question-container-text-area'>
              <label htmlFor="offenseDescription">
              {infraction === "Failure to Complete Work" ||
                infraction === "Positive Behavior Shout Out!" ||
                infraction === "Behavioral Concern"
                  ? getTitle(infraction)
                  : "For all offenses other than positive behavior shout out and failure to complete work"} *</label>
              <h5>
                {infraction === "Failure to Complete Work" ||
                infraction === "Positive Behavior Shout Out!" ||
                infraction === "Behavioral Concern"
                  ? getDescription(infraction)
                  : "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."}
              </h5>
              <input
                type="text"
                id="offenseDescription"
                name="offenseDescription"
                value={offenseDescription}
                onChange={(e) => handleAnswer(e.target.value)}
                required
              />
            </div>
            <button type="submit">Next</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MyForm;
