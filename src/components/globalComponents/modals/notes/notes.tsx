import React, { useState,useEffect } from 'react';
import './notes.css';
import { TextField } from '@mui/material';
import axios from 'axios';
import { baseUrl } from 'src/utils/jsonData';

const NotesComponent = (props:any) => {
    const [noteText, setNoteText] = useState({createdBy: "",
      event:"Notes", content:""});
    const [toastMessage, setToastMessage] = useState("");
    const [isToast, setIsToast] = useState(false);
    const [toastType, setToastType] = useState("")

    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };

      const loggedInUser = sessionStorage.getItem("email");


//Add PUT controller to update followup date
    const handleSubmitNotes = () => {
      let url = props.panelName === "overview"? `${baseUrl}/punish/v1/guidance/notes/${props.activeTask}` : `${baseUrl}/student/v1/notes/${props.activeTask}`
    axios.put(url, noteText,{headers})
    .then(response => {
      setToastType("success-toast")
      setIsToast(true)
      setToastMessage("Notes Has Been Submitted")
      
      setTimeout(()=>{
        setIsToast(false)
        setToastMessage("");
        setToastType("")
        props.setDisplayModal(false);
        props.setUpdatePage((prev: any) => !prev);

      },3000)
    })
    .catch(error => {
      setToastType("warning-toast")
      setIsToast(true)
      setToastMessage("Something Went Wrong, Try Again")
      
      setTimeout(()=>{
        setIsToast(false)
        setToastMessage("");
        setToastType("")

  
      },3000)

    });

  


      };
    


    const handleNoteChange = (event:any) => {
      if(loggedInUser != null) {
        setNoteText({createdBy: loggedInUser, event:"Notes", content: event.target.value});
    }}

    return (
        <div className='nm-modal-container'>
           {isToast && <div className={toastType}>{toastMessage}</div>} 

            <div className='nm-header'>
            <div className='close-icon' onClick={()=>props.setDisplayModal(false)}>[x]</div>
            <div className='id-num'>Id:{props.activeTask}</div>
            </div>
            <h3>Notes</h3>
         

            <div className='notes-container'>
            <TextField
          id="outlined-multiline-flexible"
          label="Add a note"
          multiline
          fullWidth
          minRows={8}
          maxRows={8}
          value={noteText.content}
          onChange={handleNoteChange}


        />
            </div>
            <div className="btn-container">
            <button onClick={handleSubmitNotes} className='submit-button'  >Submit</button>
            </div>
         
        </div>
    );
}

export default NotesComponent;
