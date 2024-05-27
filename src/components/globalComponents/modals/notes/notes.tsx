import React, { useState,useEffect } from 'react';
import './notes.css';
import { TextField } from '@mui/material';

const NotesComponent = (props:any) => {
    const [noteText, setNoteText] = useState('');


//Add PUT controller to update followup date
    const handleSubmitNotes = () => {
        props.setDisplayModal(false);
    }

    const handleNoteChange = (event:any) => {
        setNoteText(event.target.value);
        console.log(noteText)
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
          value={noteText}
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
