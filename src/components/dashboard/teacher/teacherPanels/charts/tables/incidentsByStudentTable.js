import React from "react";
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

  //Get Unique Students Info
  writeUps.forEach((item) => {
    const studentEmail = item.studentEmail;
    uniqueStudents[studentEmail] = (uniqueStudents[studentEmail] || 0) + 1;
  });

  const studentsWithIncidentsList = Object.entries(uniqueStudents).map(
    ([studentEmail, incidents]) => {
      const { firstName, lastName } = writeUps.find(
        (item) => item.studentEmail === studentEmail
      );

      return {
        studentEmail,
        firstName,
        lastName,
        incidents,
        percent: ((incidents / totalIncidents) * 100).toFixed(2),
      };
    }
  );

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
            <TableCell style={{ fontSize: 18 }}>Name</TableCell>
            <TableCell style={{ fontSize: 18 }}>Write-ups</TableCell>
            <TableCell style={{ fontSize: 18 }}>Percent of Write-ups</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {studentsWithIncidentsList.map(
            (
              { studentEmail, firstName, lastName, incidents, percent },
              index
            ) => (
              <TableRow key={index}>
                <TableCell style={{ fontSize: 14 }}>
                  {firstName} {lastName}
                </TableCell>
                <TableCell style={{ fontSize: 14 }}>{incidents}</TableCell>
                <TableCell style={{ fontSize: 14 }}>{percent}%</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IncidentsByStudentTable;
