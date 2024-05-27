import React, { useState } from 'react';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import './scheduler.css';

const SchedulerComponent = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

    return (
        <div className='generic-modal-container'>
            <h1>What date would you like to reschedule this task for?</h1>
            <div className='calendar'>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                        displayStaticWrapperAs="desktop"
                        openTo="day"
                        value={selectedDate}
                        onChange={(newValue) => {
                            if (newValue !== null) {
                                setSelectedDate(newValue);
                            }
                        }}
                    />
                </LocalizationProvider>
            </div>
        </div>
    );
}

export default SchedulerComponent;
