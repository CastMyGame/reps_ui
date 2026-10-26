import React, { useState,useEffect } from 'react';
import './notes.css';
import { TextField } from '@mui/material';
import axios from 'axios';
import { studentSecurityError } from 'src/utils/studentSecurity';
import { requireGuidanceRecord, guidancePath } from 'src/utils/guidanceSecurity';
import { useRef } from 'react';
import { baseUrl } from 'src/utils/jsonData';

const NotesComponent = (props:any) => {
    const [noteText, setNoteText] = useState({createdBy: "",
      event:"Notes", content:""});
    const inFlight = useRef(false);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isToast, setIsToast] = useState(false);
    const [toastType, setToastType] = useState("")

    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };

      const loggedInUser = sessionStorage.getItem("email");


//Add PUT controller to update followup date
    const handleSubmitNotes = () => {
    if (inFlight.current) return;
    inFlight.current = true; setSaving(true);
      let url = props.panelName === "overview"? guidancePath("notes", props.activeTask) : `${baseUrl}/student/v1/notes/${props.activeTask}`
    axios.put(url, {event: noteText.event, content: noteText.content},{headers})
    .then(response => {
      if (props.panelName === "overview") requireGuidanceRecord(response.data, props.activeTask);
      else if (!response.data?.studentIdNumber) throw new Error("Note save not confirmed");
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
      setToastMessage(studentSecurityError(error))
      
      setTimeout(()=>{
        setIsToast(false)
        setToastMessage("");
        setToastType("")

  
      },3000)

    }).finally(() => { inFlight.current = false; setSaving(false); });

  


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
            <button disabled={saving} onClick={handleSubmitNotes} className='submit-button'  >Submit</button>
            </div>
         
        </div>
    );
}

export default NotesComponent;
