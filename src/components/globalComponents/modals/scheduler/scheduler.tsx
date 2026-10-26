import React, { useState,useEffect } from 'react';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import './scheduler.css';
import { baseUrl } from 'src/utils/jsonData';
import axios from 'axios';
import { studentSecurityError } from 'src/utils/studentSecurity';
import { requireGuidanceRecord, guidancePath } from 'src/utils/guidanceSecurity';
import { useRef } from 'react';

const SchedulerComponent = (props:any) => {
    const [selectedDate, setSelectedDate] = useState<DateTime | null>(DateTime.now());
    const inFlight = useRef(false);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isToast, setIsToast] = useState(true);
    const [toastType, setToastType] = useState("success-toast")
//Add PUT controller to update followup date
//Add PUT controller to update followup date
const handleSetDate = () => {
    if (inFlight.current) return;
    inFlight.current = true; setSaving(true);
    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };

    const url =guidancePath("followup", props.activeTask)
    axios.put(url, {"followUpDate":selectedDate?.toFormat("yyyyMMdd"),"status":"DORMANT"},{headers})
    .then(response => {
      requireGuidanceRecord(response.data, props.activeTask, "DORMANT");
      setToastType("success-toast")
      setIsToast(true)
      setToastMessage("Follow-up date saved. This does not confirm email delivery.")
      
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

  
      },3000)    }).finally(() => { inFlight.current = false; setSaving(false); });

   

      };
    
    return (
        <div className='generic-modal-container'>
                   {isToast && <div className={toastType}>{toastMessage}</div>} 

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
            <button disabled={saving} onClick={handleSetDate} className='time-set-button'  >Set</button>
            </div>
         
        </div>
    );
}

export default SchedulerComponent;
