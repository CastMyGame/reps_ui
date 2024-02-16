import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../../../../utils/jsonData';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, Typography } from '@mui/material';


const IncidentsByStudentTable = ({writeUps = []}) => {
  

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