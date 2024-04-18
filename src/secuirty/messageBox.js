import React, { useEffect, useState } from 'react';
import { Button, Card, FormControl, InputLabel, MenuItem, Select, Snackbar, TextField, TextareaAutosize, Typography } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import { baseUrl } from '../utils/jsonData';
import "./modal.css"
import { get } from '../utils/api/api';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const MessageBox = ({ setContactUsDisplayModal, contactUsDisplayModal }) => {
  const topics = ['General Inquiry', 'Login Issue', 'Billing Issue', 'Student Issue', 'Tool Issue'];

  const [data, setData] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState("")


  useEffect(() => {
    const fetchPunishmentData = async () => {
      try {
        const response = await get(`messaging/v1/`);
        setData(response.receivedMessages);
        console.log(data)
      } catch (err) {
        console.error(err);
      }
    };

    fetchPunishmentData();
   
  }, []);

  return (
    <div className="email-container" >
      <div className='pop-modal' style={{ border: '3px solid grey'}}>
        <div className="email-list" style={{ backgroundColor: 'white', width: '100%', border: '1px solid grey', padding: '20px' }}>
          {data.map((message, index) => (
            <Card
              onClick={() => setSelectedMessage(message)}
              style={{
                height: '40px',
                marginBottom: '10px',
                backgroundColor:
                  message.messageId === selectedMessage.messageId
                    ? '#f0f0f0'
                    : 'white',
                cursor: 'pointer', // Add cursor pointer on hover
                padding: '5px', // Add padding for better readability
                borderRadius: '5px', // Add border radius for rounded corners
                borderLeft: message.messageId === selectedMessage.messageId ? '5px solid #007bff' : 'none', // Add left border for selected message
              }}
              key={index}
            >
              <p>
                {message.messageTitle} - {message.status}
              </p>
            </Card>
          ))}
        </div>
        <div className="email-content" style={{ backgroundColor: ' #D3D3D3', width: '100%', height:"500px" }}>
          {selectedMessage.messageTitle && (
            <div>
              <p> From: {selectedMessage.sender}</p> 
              <p> To: {selectedMessage.recipient}</p> 

              <p> On {selectedMessage.timeCreated}</p>

              <h3>{selectedMessage.messageTitle}</h3>
              <p>{selectedMessage.messageContent}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};