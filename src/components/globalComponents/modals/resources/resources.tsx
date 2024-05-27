import React, { useState,useEffect } from 'react';
import './resources.css';

const SendResourcesComponent = (props:any) => {
    const [resourcesToSend, setResourcesToSend] = useState(null);


//Add PUT controller to update followup date
    const handleSubmitResources = () => {
        props.setDisplayModal(false);
    }

    const handleResourceChange = (event:any) => {
        setResourcesToSend(event.target.value);
    }

    const resourceOptions = [
      {value:"res1", label:"Resource 1"},
      {value:"res2", label:"Resource 2"},
      {value:"res3", label:"Resource 3"},
      {value:"res4", label:"Resource 4"},
      {value:"res5", label:"Resource 5"},

    ]

    return (
        <div className='generic-modal-container'>
            <div className='header'>
            <div className='close-icon' onClick={()=>props.setDisplayModal(false)}>[x]</div>
            <div className='id-num'>Id:{props.activeTask}</div>
            </div>
            <h3>Resources Coming Soon</h3>
         

            <div className='select-container'>
           
            </div>
            <div className="btn-container">
            <button onClick={handleSubmitResources} className='submit-button'  >Submit</button>
            </div>
         
        </div>
    );
}

export default SendResourcesComponent;
