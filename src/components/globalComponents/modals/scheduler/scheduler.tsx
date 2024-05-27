import React, { useState,useEffect } from 'react';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import './scheduler.css';

const SchedulerComponent = (props:any) => {
    const [selectedDate, setSelectedDate] = useState<DateTime | null>(DateTime.now());

//Add PUT controller to update followup date
const handleSetDate = () =>{
    props.setDisplayModal(false);

}

    return (
        <div className='generic-modal-container'>
            <div className='header'>
            <div className='close-icon' onClick={()=>props.setDisplayModal(false)}>[x]</div>
            <div className='id-num'>Id:{props.activeTask}</div>
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
