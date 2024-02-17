import React, {useEffect, useState} from 'react';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, TextField, Typography } from '@mui/material';
import { dateCreateFormat } from '../../../../global/helperFunctions';


const RecentIncidents = ({data = []}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);


  useEffect(() => {
    // Filter the data based on the search query
    const filteredRecords = data.filter(record => {
      const { student, infraction } = record;
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
  
      return fullName.includes(searchQuery.toLowerCase()) || 
             infraction.infractionName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  
    // Sort the filtered records based on the number of incidents in descending order
    const sortedData = [...filteredRecords];
    const uniqueStudentIds = sortedData.reduce((uniqueIds, record) => {
      const studentId = record.student.studentIdNumber;
  
      // Check if the studentId is not already in the uniqueIds array
      if (!uniqueIds.includes(studentId)) {
        uniqueIds.push(studentId);
      }
  
      return uniqueIds;
    }, []);

    const recentRecords = []
  
    sortedData.reverse()
    const recentContacts = uniqueStudentIds.map(studentId => {
      // Find the most recent record for each unique studentId
      const mostRecentRecord = sortedData.find(record => record.student.studentIdNumber === studentId);
      return mostRecentRecord;
    });
  
    setFilteredData(recentContacts);

  }, [data, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  return (
    <TableContainer component={Paper}>
       <Typography variant="h6" align="center" style={{ margin: '10px' }}>
        Student Contact Reminder
      </Typography>
      <Table>
        <TableHead>
        <TableRow>
        <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
      />
        </TableRow>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Last Contacted</TableCell>
            <TableCell>Contact Reason</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {filteredData.sort((a, b) => new Date(a.timeCreated) - new Date(b.timeCreated)).slice(0, 10).map((record, index) => (
            <TableRow key={index}>
              <TableCell>{record.student.firstName} {record.student.lastName} {String(record.student.studentIdNumber).substring(0,5)}</TableCell>
              <TableCell>{dateCreateFormat(record.timeCreated)}</TableCell>
              <TableCell>{record.infraction.infractionName}</TableCell> 
              <TableCell>{record.infraction.infractionDescription[1]}</TableCell> 

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentIncidents;
