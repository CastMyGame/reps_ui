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

const IncidentsByStudentTable = ({ writeUpResponse = [] }) => {
  const uniqueStudents = {};
  const totalIncidents = writeUpResponse.length;
  // const [searchQuery, setSearchQuery] = useState("");
  // const [filteredData, setFilteredData] = useState([]);

  const studentsWithIncidentsList =
    // Object.entries(writeUpResponse).map(
    //   ([studentEmail, incidents]) => {
    //     const studentRecord = writeUpResponse.find(
    //       (item) => item.studentEmail === studentEmail
    //     );

    //     const firstName =
    //       studentRecord.firstName || studentRecord.studentFirstName;
    //     const lastName = studentRecord.lastName || studentRecord.studentLastName;
    writeUpResponse.filter((teacherDto) => {});

  // return {
  //   studentEmail,
  //   firstName,
  //   lastName,
  //   incidents,
  //   percent: ((incidents / totalIncidents) * 100).toFixed(2),
  // };

  // useEffect(() => {
  //   // Filter the data based on the search query
  //   const filteredRecords = writeUpResponse.filter((record) => {
  //     const fullName =
  //       `${record.studentFirstName} ${record.studentLastName}`.toLowerCase();

  //     return (
  //       fullName.includes(searchQuery.toLowerCase()) ||
  //       record.infractionName.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   });

  //   // Sort the filtered records based on the number of incidents in descending order
  //   const sortedData = [...filteredRecords];
  //   const uniqueStudentIds = sortedData.reduce((uniqueIds, record) => {
  //     const studentEmail = record.studentEmail;

  //     // Check if the studentId is not already in the uniqueIds array
  //     if (!uniqueIds.includes(studentEmail)) {
  //       uniqueIds.push(studentEmail);
  //     }

  //     return uniqueIds;
  //   }, []);

  //   const recentRecords = [];

  //   // sortedData.reverse();
  //   // const recentContacts = uniqueStudentIds.map((studentEmail) => {
  //   //   // Find the most recent record for each unique studentId
  //   //   const mostRecentRecord = sortedData.find(
  //   //     (record) => record.studentEmail === studentEmail
  //   //   );
  //   //   return mostRecentRecord;
  //   // });

  //   setFilteredData(studentsWithIncidentsList);
  // }, [writeUpResponse, searchQuery]);

  // //Get Unique Students Info
  writeUpResponse.forEach((item) => {
    const studentEmail = item.studentEmail;
    uniqueStudents[studentEmail] = (uniqueStudents[studentEmail] || 0) + 1;
  });

  studentsWithIncidentsList.sort((a, b) => b.incidents - a.incidents);

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
            <TableCell style={{ fontSize: "2rem" }}>Name</TableCell>
            <TableCell style={{ fontSize: "2rem" }}>Write-ups</TableCell>
            <TableCell style={{ fontSize: "2rem" }}>
              Percent of Write-ups
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {writeUpResponse.map((record, index) => (
            <TableRow key={index}>
              <TableCell style={{ fontSize: "1.5rem" }}>
                {record.studentFirstName} {record.studentLastName}
              </TableCell>
              <TableCell style={{ fontSize: "1.5rem" }}>
                {record.timeCreated}
              </TableCell>
              <TableCell style={{ fontSize: "1.5rem" }}>
                {record.status}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IncidentsByStudentTable;
