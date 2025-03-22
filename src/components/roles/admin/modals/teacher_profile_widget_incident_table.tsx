import React, { useEffect, useState } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import { TeacherReferral } from "src/types/responses";
import { Student } from "src/types/school";
import { StudentIncident } from "src/types/menus";

interface TeacherProfileIncidentsProps {
  writeUps: TeacherReferral[];
  listOfStudents: Student[];
}

const TeacherProfileIncidentsByStudentTable: React.FC<
  TeacherProfileIncidentsProps
> = ({ writeUps, listOfStudents }) => {
  const uniqueStudents: Record<string, number> = {};
  const totalIncidents = writeUps.length;
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<StudentIncident[]>([]);

  

  useEffect(() => {
    const studentMap = new Map(
      listOfStudents.map((student) => [student.studentEmail, student])
    );
    // Filter the data based on the search query
    const filteredRecords = writeUps.filter((record) =>
      studentMap.has(record.studentEmail)
    );

    // Sort the filtered records based on the number of incidents in descending order
    const uniqueStudentIncidents: Record<string, number> = {};
    filteredRecords.forEach((item) => {
      uniqueStudentIncidents[item.studentEmail] =
        (uniqueStudentIncidents[item.studentEmail] || 0) + 1;
    });

    // Generate incident summary with student names
    const studentsWithIncidentsList = Object.entries(
      uniqueStudentIncidents
    ).map(([studentEmail, incidents]) => {
      const studentRecord = studentMap.get(studentEmail); // Retrieve student details

      return {
        studentEmail,
        firstName: studentRecord?.firstName ?? "Unknown",
        lastName: studentRecord?.lastName ?? "Unknown",
        incidents,
        percent: ((incidents / totalIncidents) * 100).toFixed(2),
      };
    });

    // Sort by highest number of incidents
    studentsWithIncidentsList.sort((a, b) => b.incidents - a.incidents);

    setFilteredData(studentsWithIncidentsList);
  }, [writeUps, searchQuery, listOfStudents, totalIncidents]);

  // //Get Unique Students Info
  writeUps.forEach((item) => {
    const studentEmail = item.studentEmail;
    uniqueStudents[studentEmail] = (uniqueStudents[studentEmail] || 0) + 1;
  });

  const studentsWithIncidentsList = Object.entries(uniqueStudents).map(
    ([studentEmail, incidents]) => {
      const studentMap = new Map(
        listOfStudents.map((student) => [student.studentEmail, student])
      );
      const studentRecord = studentMap.get(studentEmail);

      return {
        studentEmail,
        firstName: studentRecord?.firstName ?? "Unknown",
        lastName: studentRecord?.lastName ?? "Unknown",
        incidents,
        percent: ((incidents / totalIncidents) * 100).toFixed(2),
      };
    }
  );

  filteredData.sort((a, b) => b.incidents - a.incidents);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ fontSize: 18 }}>Name</TableCell>
            <TableCell style={{ fontSize: 18, justifyContent: "left" }}>
              Write-ups
            </TableCell>
            <TableCell style={{ fontSize: 18 }}>Percent of Write-ups</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((record, index) => (
            <TableRow key={index}>
              <TableCell style={{ fontSize: 12 }}>
                {record.firstName || record.studentEmail} {record.lastName}
              </TableCell>
              <TableCell style={{ fontSize: 16 }}>{record.incidents}</TableCell>
              <TableCell style={{ fontSize: 16 }}>{record.percent}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeacherProfileIncidentsByStudentTable;
