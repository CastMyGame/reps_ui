import React, { useState,useEffect } from 'react';
import './notes.css';
import { TextField } from '@mui/material';
import axios from 'axios';
import { baseUrl } from 'src/utils/jsonData';

const NotesComponent = (props:any) => {
    const [noteText, setNoteText] = useState({event:"Notes", content:""});

    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };
//Add PUT controller to update followup date
    const handleSubmitNotes = () => {
    const url =`${baseUrl}/punish/v1/updateGuidance/notes/${props.activeTask}`
    axios.put(url, noteText,{headers})
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
    });

    props.setDisplayModal(false);

        // You can use the finalPayload as needed (e.g., send it to an API)
      };
    


    const handleNoteChange = (event:any) => {
        setNoteText({event:"Notes", content: event.target.value});
    }

    return (
        <div className='generic-modal-container'>
            <div className='header'>
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
