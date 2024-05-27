import React, { useState,useEffect } from 'react';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import './scheduler.css';

const SchedulerComponent = () => {
    const [selectedDate, setSelectedDate] = useState<DateTime | null>(DateTime.now());



    return (
        <div className='generic-modal-container'>
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
            <button className='time-set-button'  >Set</button>
            </div>
         
        </div>
    );
}

export default SchedulerComponent;
