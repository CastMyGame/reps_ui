import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../../../../utils/jsonData';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, Typography } from '@mui/material';


const IncidentsByStudentTable = ({data = []}) => {
  const [writeUps,setWriteUps] = useState([])
  
  const url = `${baseUrl}/punish/v1/writeUps`;
  
  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
      const token = sessionStorage.getItem('Authorization');
      const headers = { Authorization: `Bearer ${token}` };
      const url = `${baseUrl}/punish/v1/writeUps`;
      const response = await axios.get(url, { headers }) // Pass the headers option with the JWT token
      setWriteUps(response.data);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // Token might have expired, try refreshing the token
          try {
            // Implement token refresh logic here
            // This might involve making a separate request to refresh the token
            // Update the sessionStorage with the new token

            // After refreshing the token, retry the original request
            const newToken = sessionStorage.getItem('Authorization');
            const newHeaders = { Authorization: `Bearer ${newToken}` };
            const url = `${baseUrl}/punish/v1/writeUps`;
            const response = await axios.get(url, { headers }) // Pass the headers option with the JWT token
      
            setWriteUps(response.data);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
          }
        } else {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, []);
  
  const uniqueStudents = {};
  const totalIncidents = writeUps.length;

//Get Unique Students Info
  writeUps.forEach(item => {
    const studentId = item.student.studentIdNumber;
    uniqueStudents[studentId] = (uniqueStudents[studentId] || 0) + 1;
  });

  
  const studentsWithIncidentsList = Object.entries(uniqueStudents).map(([studentId, incidents]) => {
    const { firstName, lastName } = writeUps.find(item => item.student.studentIdNumber === studentId).student;
    return {
      studentId,
      firstName,
      lastName,
      incidents,
      percent: ((incidents / totalIncidents) * 100).toFixed(2),
    };
  });
  
 studentsWithIncidentsList.sort((a, b) => b.incidents - a.incidents);

  return (
    <TableContainer component={Paper}>
       <Typography variant="h6" align="center" style={{ margin: '10px' }}>
        Write-up % By Student
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Write-ups</TableCell>
            <TableCell>Percent of Write-ups</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {studentsWithIncidentsList.map(({ studentId, firstName, lastName, incidents, percent }, index) => (
            <TableRow key={index}>
              <TableCell>{firstName} {lastName}</TableCell>
              <TableCell>{incidents}</TableCell>
              <TableCell>{percent}%</TableCell> 
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IncidentsByStudentTable;
