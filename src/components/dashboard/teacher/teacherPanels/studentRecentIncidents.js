import React, {useEffect, useState} from 'react';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, TextField } from '@mui/material';
import { dateCreateFormat } from '../../global/helperFunctions';


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
    const sortedData = [...filteredRecords].sort((a, b) => b.incidents - a.incidents);

    setFilteredData(sortedData);
  }, [data, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  return (
    <TableContainer component={Paper}>
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
            <TableCell>Date</TableCell>
            <TableCell>Referals</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.slice(0,10).map((record, index) => (
            <TableRow key={index}>
              <TableCell>{record.student.firstName} {record.student.lastName} {String(record.student.studentIdNumber).substring(0,5)}</TableCell>
              <TableCell>{dateCreateFormat(record.timeCreated)}</TableCell>
              <TableCell>{record.infraction.infractionName}</TableCell> 
              <TableCell>{record.infraction.infractionDescription}</TableCell> 

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentIncidents;
