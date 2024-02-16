import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { baseUrl } from "../../../../utils/jsonData";
import axios from "axios";

export const Top5TeacherRatioTable = ({data = []}) =>{
  const [teacherData,setTeacherData] = useState([])
 



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
    
 
    




  const teachersWithIncidentsList = []
  const schoolTotal =  data.length
  const posAvg = data.filter(item => item.infraction.infractionName === "Positive Behavior Shout Out!").length
  const negAvg = data.filter(item => item.infraction.infractionName !== "Positive Behavior Shout Out!").length



const schoolAvg = {pos:((posAvg/schoolTotal * 100).toFixed(2)) ,neg:((negAvg/schoolTotal * 100).toFixed(2))}

  teacherData.map((teacher) => {
    if (data) {
        const teacherIncidents = data.filter(item => item.teacherEmail === teacher.email);


if(teacherIncidents.length>0){
      const totalIncidents = teacherIncidents.length;
      const posIncidents = teacherIncidents.filter(item => item.infraction.infractionName === "Positive Behavior Shout Out!").length;
      const negIncidents = teacherIncidents.filter(item => item.infraction.infractionName !== "Positive Behavior Shout Out!").length;

      teachersWithIncidentsList.push({teacherName:teacher.firstName + " " + teacher.lastName, posRatio:(posIncidents/totalIncidents * 100).toFixed(2),negRatio:(negIncidents/totalIncidents * 100).toFixed(2)})
}


      

         
      
    }
});


   return (
      <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {/* Header Row */}
              <TableRow style={{ backgroundColor: '#2196F3', color: 'white' }}>
                <TableCell>School Average %</TableCell>
                <TableCell>{`Pos:${schoolAvg.pos}% Neg: ${schoolAvg.neg}%`}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Sub-Header Row */}
              <TableRow style={{ backgroundColor: '#64B5F6', color: 'white' }}>
                <TableCell>Teacher</TableCell>
                <TableCell>Pos Ratios</TableCell>
              </TableRow>
    
              {teachersWithIncidentsList
                .sort((a, b) => b.posRatio - a.posRatio)
                .slice(0, 3)
                .map((teacher) => (
                  <TableRow key={teacher.teacherName}>
                    <TableCell>{teacher.teacherName}</TableCell>
                    <TableCell>{teacher.posRatio}</TableCell>
                  </TableRow>
                ))}
    
              <TableRow style={{ backgroundColor: '#64B5F6', color: 'white' }}>
                <TableCell>Teacher</TableCell>
                <TableCell>Neg %</TableCell>
              </TableRow>
    
              {teachersWithIncidentsList
                .sort((a, b) => b.negRatio - a.negRatio)
                .slice(0, 3)
                .map((teacher) => (
                  <TableRow key={teacher.teacherName}>
                    <TableCell>{teacher.teacherName}</TableCell>
                    <TableCell>{teacher.negRatio}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
    
   



    
}