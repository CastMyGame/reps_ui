import React, { useState } from 'react';
import './guidanceRequestModal.css';
import { Box, Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import axios from 'axios';
import { baseUrl } from '../../../../utils/jsonData';

const GuidanceRequestModal = (props: any) => {
    const [noteText, setNoteText] = useState({ event: "Notes", content: "" });
    const [toastMessage, setToastMessage] = useState("");
    const [isToast, setIsToast] = useState(false);
    const [toastType, setToastType] = useState("");
    const [selectValue, setSelectValue] = useState<any>([]);

    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const handleSubmitNotes = () => {
    let  payload = [{
        guidance:{
          studentEmail: props.studentEmail,
          referralDescription: [selectValue],
        },
        linkToPunishment: null,
      }]

      axios
      .post(`${baseUrl}/punish/v1/guidance/formList`, payload, {
        headers: headers,
      })
      .then(function (res) {
        window.alert(`${selectValue} has been created`)
        // setToast({ display: true, message: "Referral Succesfuly Created" });
        // setTimeout(() => {
        //   setLoading(false);
        //   setToast({ display: false, message: "" });
        // }, 1000);
        // resetForm();
        // setInfractionDescriptionSelected("");
        props.setDisplayModal(false)
      })
      .catch(function (error) {
        console.error(error);
        // setToast({ display: true, message: "Something Went Wrong" });
        // setTimeout(() => {
        //   setLoading(false);
        //   setToast({ display: false, message: "" });
        // }, 2000);
      });
  };

    const handleChange = (event: SelectChangeEvent) => {
        setSelectValue(event.target.value);
    };

    const handleNoteChange = (event: any) => {
        setNoteText({ event: "Notes", content: event.target.value });
    };

    const MenuProps = {
      PaperProps: {
        style: {
          // maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    };


    const selectOption = [
      { value: "Grade Change Request", label: "Grade Change Request" },
      {
        value: "Schedule Change Request",
        label: "Schedule Change Request",
      }
    ];
  

    return (
        <div className='nm-modal-container'>
            {isToast && <div className={toastType}>{toastMessage}</div>}

            <div className='nm-header'>
                <div className='close-icon' onClick={() => props.setDisplayModal(false)}>[x]</div>
                <div className='id-num'>Id:{props.activeTask}</div>
            </div>
            <div className='grm-row'>
                <h3 style={{marginRight:"20px"}}>Request</h3>
                    <Select
                      sx={{ width: "90%", padding:"5px 5px" }}
                      value={selectValue}
                      onChange={handleChange}
                      renderValue={(selected) => {
                        // Check if selected is an array, if not, wrap it in an array
                        const selectedArray = Array.isArray(selected)
                          ? selected
                          : [selected];

                        return (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {selectedArray.map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                sx={{ fontSize: 18 }}
                              />
                            ))}
                          </Box>
                        );
                      }}
                      MenuProps={MenuProps}
                    >
                    {selectOption.map((name:any) => ( 
                        <MenuItem
                          key={name.value}
                          value={name.value}
                          // style={getStyles(name, studentNames, defaultTheme)}
                          sx={{ fontSize: 18, zIndex:20 }}
                        >
                          {name.label}
                        </MenuItem>
                       ))} 
                    </Select>
            </div>

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
                <button onClick={handleSubmitNotes} className='submit-button'>Submit</button>
            </div>
        </div>
    );
}

export default GuidanceRequestModal;
