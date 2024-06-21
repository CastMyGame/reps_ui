import React, { useEffect, useState } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { dateCreateFormat } from "../../../../../components/globalComponents/helperFunctions";

const RecentContacts = ({ data = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Filter the data based on the search query
    const filteredRecords = data.filter((record) => {
      const fullName =
        `${record.studentFirstName} ${record.studentLastName}`.toLowerCase();

      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        record.infractionName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Sort the filtered records based on the number of incidents in descending order
    const sortedData = [...filteredRecords];
    const uniqueStudentIds = sortedData.reduce((uniqueIds, record) => {
      const studentEmail = record.studentEmail;

      // Check if the studentId is not already in the uniqueIds array
      if (!uniqueIds.includes(studentEmail)) {
        uniqueIds.push(studentEmail);
      }

      return uniqueIds;
    }, []);

    const recentRecords = [];

    sortedData.reverse();
    const recentContacts = uniqueStudentIds.map((studentEmail) => {
      // Find the most recent record for each unique studentId
      const mostRecentRecord = sortedData.find(
        (record) => record.studentEmail === studentEmail
      );
      return mostRecentRecord;
    });

    setFilteredData(recentContacts);
  }, [data, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h4" align="center" style={{ margin: "10px" }}>
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
            <TableCell style={{ fontSize: "2rem" }}>Name</TableCell>
            <TableCell style={{ fontSize: "2rem" }}>Last Contacted</TableCell>
            <TableCell style={{ fontSize: "2rem" }}>Contact Reason</TableCell>
            <TableCell style={{ fontSize: "2rem" }}>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData
            .sort((a, b) => new Date(a.timeCreated) - new Date(b.timeCreated))
            .slice(0, 10)
            .map((record, index) => (
              <TableRow key={index}>
                <TableCell style={{ fontSize: "1.5rem" }}>
                  {record.studentFirstName} {record.studentLastName}
                </TableCell>
                <TableCell style={{ fontSize: "1.5rem" }}>
                  {dateCreateFormat(record.timeCreated)}
                </TableCell>
                <TableCell style={{ fontSize: "1.5rem" }}>
                  {record.infractionName}
                </TableCell>
                <TableCell style={{ fontSize: "1.5rem" }}>
                  {record.infractionDescription[0]}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentContacts;
