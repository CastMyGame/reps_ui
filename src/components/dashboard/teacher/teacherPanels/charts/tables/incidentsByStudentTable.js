import React, { useEffect, useState } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
} from "@mui/material";

const IncidentsByStudentTable = ({ writeUps = [] }) => {
  const uniqueStudents = {};
  const totalIncidents = writeUps.length;
  const[searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Filter the data based on the search query
    const filteredRecords = writeUps.filter((record) => {
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

    // sortedData.reverse();
    // const recentContacts = uniqueStudentIds.map((studentEmail) => {
    //   // Find the most recent record for each unique studentId
    //   const mostRecentRecord = sortedData.find(
    //     (record) => record.studentEmail === studentEmail
    //   );
    //   return mostRecentRecord;
    // });

    setFilteredData(studentsWithIncidentsList);
  }, [writeUps, searchQuery]);

  // //Get Unique Students Info
  writeUps.forEach((item) => {
    const studentEmail = item.studentEmail;
    uniqueStudents[studentEmail] = (uniqueStudents[studentEmail] || 0) + 1;
  });

  const studentsWithIncidentsList = Object.entries(uniqueStudents).map(
    ([studentEmail, incidents]) => {
      const studentRecord = writeUps.find(
        (item) => item.studentEmail === studentEmail
      );

      const firstName = studentRecord.firstName;
      const lastName = studentRecord.lastName;
      console.log("answer",incidents)


      return {
        studentEmail,
        firstName,
        lastName,
        incidents,
        percent: ((incidents / totalIncidents) * 100).toFixed(2),
      };
    }
  );

  filteredData.sort((a, b) => b.incidents - a.incidents);

  return (
    <TableContainer component={Paper}>
      <Typography
        variant="h4"
        align="center"
        style={{ margin: "10px", fontSize: 24 }}
      >
        Write-up % By Student
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ fontSize: 18 }}>Name</TableCell>
            <TableCell style={{ fontSize: 18 }}>Write-ups</TableCell>
            <TableCell style={{ fontSize: 18 }}>Percent of Write-ups</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((record, index) => (
              <TableRow key={index}>
                <TableCell style={{ fontSize: 14 }}>
                  {record.firstName} {record.lastName}
                </TableCell>
                <TableCell style={{ fontSize: 14 }}>{record.incidents}</TableCell>
                <TableCell style={{ fontSize: 14 }}>{record.percent}%</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IncidentsByStudentTable;
