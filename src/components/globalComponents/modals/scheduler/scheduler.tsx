import React, { useState,useEffect } from 'react';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import './scheduler.css';
import { baseUrl } from 'src/utils/jsonData';
import axios from 'axios';

const SchedulerComponent = (props:any) => {
    const [selectedDate, setSelectedDate] = useState<DateTime | null>(DateTime.now());

//Add PUT controller to update followup date
//Add PUT controller to update followup date
const handleSetDate = () => {
    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };

    const url =`${baseUrl}/punish/v1/guidance/followup/${props.activeTask}`
    axios.put(url, {"followUpdate":selectedDate?.toFormat("yyyyMMdd")},{headers})
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
    });

    props.setDisplayModal(false);
    setTimeout(()=>{
        props.setUpdatePage((prev: any) => !prev);

    },500)

      };
    
    return (
        <div className='generic-modal-container'>
            <div className='header'>
            <div className='close-icon' onClick={()=>props.setDisplayModal(false)}>[x]</div>
            <div className='id-num'></div>
            </div>
         
            <h3>Set the Date To Follow Up this Task On</h3>

            <div className='calendar'>
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                    <StaticDatePicker
                        disablePast={true}
                        displayStaticWrapperAs="desktop"
                        openTo="day"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                    />
                </LocalizationProvider>
            </div>
            <div className="btn-container">
            <p>{selectedDate?.toFormat('LLL dd yyyy')}</p>
            <button onClick={handleSetDate} className='time-set-button'  >Set</button>
            </div>
         
        </div>
    );
}

export default SchedulerComponent;
