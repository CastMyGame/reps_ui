import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { baseUrl } from "../../../../utils/jsonData";
import axios from "axios";

export const WorseClassTable = ({ data = [] }) => {
  const [teacherData, setTeacherData] = useState([]);

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const url = `${baseUrl}/employees/v1/employees/TEACHER`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('Authorization');
        const headers = { Authorization: `Bearer ${token}` };
        const url = `${baseUrl}/employees/v1/employees/TEACHER`;

        const response = await axios.get(url, { headers });
        setTeacherData(response.data);
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
            const url = `${baseUrl}/employees/v1/employees/TEACHER`;

            const response = await axios.get(url, { headers: newHeaders });
            setTeacherData(response.data);
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

  const getTeacherWithMostIncidents = (classItem) => {
    const maxBlock = Math.max(classItem.blocks.block1, classItem.blocks.block2, classItem.blocks.block3, classItem.blocks.block4);
    const teachersWithMaxBlock = teacherData.filter((teacher) => {
      const negWriteUpData = data.filter((item) => item.infraction.infractionName !== "Positive Behavior Shout Out!" && item.teacherEmail === teacher.email);
      const blockIncidents = negWriteUpData.filter((item) => item.classPeriod === `block${maxBlock}`).length;
      return blockIncidents > 0;
    });

    const teacherWithMostIncidents = teachersWithMaxBlock.reduce((maxTeacher, currentTeacher) => {
      const blockIncidents = data.filter((item) => item.teacherEmail === currentTeacher.email && item.classPeriod === `block${maxBlock}`).length;
      return blockIncidents > maxTeacher.incidents ? { ...currentTeacher, incidents: blockIncidents } : maxTeacher;
    }, { incidents: -1 });

    return teacherWithMostIncidents.email;
  };

  // Move this declaration inside the component function
  const worseClassByIncident = teacherData.map((teacher) => {
    const negWriteUpData = data.filter((item) => item.infraction.infractionName !== "Positive Behavior Shout Out!" && item.teacherEmail === teacher.email);
    const block1 = negWriteUpData.filter((item) => item.classPeriod === "block1").length;
    const block2 = negWriteUpData.filter((item) => item.classPeriod === "block2").length;
    const block3 = negWriteUpData.filter((item) => item.classPeriod === "block3").length;
    const block4 = negWriteUpData.filter((item) => item.classPeriod === "block4").length;

    return {
      teacherName: teacher.email,
      teacherFirstName: teacher.firstName,
      teacherLastName: teacher.lastName,
      blocks: { block1, block2, block3, block4 },
    };
  });

  const worseBlk1 = worseClassByIncident.reduce((maxTeacher, currentTeacher) => {
    return currentTeacher.blocks.block1 > maxTeacher.blocks.block1 ? currentTeacher : maxTeacher;
  }, { teacherName: "", blocks: { block1: -1, block2: -1, block3: -1, block4: -1 } });
  

  const worseBlk2 = worseClassByIncident.reduce((maxTeacher, currentTeacher) => {
    return currentTeacher.blocks.block2 > maxTeacher.blocks.block2 ? currentTeacher : maxTeacher;
  }, { teacherName: "", blocks: { block: -1, block2: -1, block3: -1, block4: -1 } });
  
  const worseBlk3 = worseClassByIncident.reduce((maxTeacher, currentTeacher) => {
    return currentTeacher.blocks.block3 > maxTeacher.blocks.block3 ? currentTeacher : maxTeacher;
  }, { teacherName: "", blocks: { block: -1, block2: -1, block3: -1, block4: -1 } });
  
  const worseBlk4 = worseClassByIncident.reduce((maxTeacher, currentTeacher) => {
    return currentTeacher.blocks.block4 > maxTeacher.blocks.block4 ? currentTeacher : maxTeacher;
  }, { teacherName: "", blocks: { block: -1, block2: -1, block3: -1, block4: -1 } });
  



  return (
    <>
    <Typography>
      Classes With Highest Write Up By Period
    </Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Period</TableCell>
            <TableCell>Teacher</TableCell>
            <TableCell>Number of Write Ups</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
    
            <TableRow>
              <TableCell>Block 1</TableCell>
              <TableCell>{worseBlk1.teacherFirstName + " " + worseBlk1.teacherLastName}</TableCell>
              <TableCell>{worseBlk1.blocks.block1}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Block 2</TableCell>
              <TableCell>{worseBlk2.teacherFirstName + " " + worseBlk2.teacherLastName}</TableCell>
              <TableCell>{worseBlk2.blocks.block2}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Block 3</TableCell>
              <TableCell>{worseBlk3.teacherFirstName + " " + worseBlk3.teacherLastName}</TableCell>
              <TableCell>{worseBlk3.blocks.block3}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Block 4</TableCell>
              <TableCell>{worseBlk4.teacherFirstName + " " + worseBlk4.teacherLastName}</TableCell>
              <TableCell>{worseBlk4.blocks.block4}</TableCell>
            </TableRow>
          
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
};
