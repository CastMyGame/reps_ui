import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
} from "@mui/material";
import { useState,useEffect } from "react";
import "./teacher_profile_modal.css";
import IncidentsByStudentTable from "src/components/globalComponents/dataDisplay/incidentsByStudentTable";
import { IncidentByTeacherPieChart } from "src/components/globalComponents/dataDisplay/incident-by-teacher-pie-chart";
import { baseUrl } from "src/utils/jsonData";
import axios from "axios";
import TeacherProfileIncidentsByStudentTable from "./teacher_profile_widget_incident_table";
import { IncidentByStudentPieChart } from "src/components/globalComponents/dataDisplay/incident-by-student-pie-chart";
import { TeacherProfileIncidentByStudentPieChart } from "./teacher_profile_widget_incident-pie";
import { TeacherProfileSpotter } from "./teacher_profile_widget_spotter";



export const TeacherDetailsModal = ({activeTeacher,setDisplayBoolean})=>{

const [data, setData] = useState([])
const [teacherProfileData,setTeacherProfileData] = useState([])

console.log("AT",activeTeacher)

useEffect(()=>{
  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const url = `${baseUrl}/punish/v1/punishments/`;
  axios.get(url,{headers})
  .then((res)=>{
    const results = res.data.filter((rec)=>rec.teacherEmail === activeTeacher.email)
    setTeacherProfileData(results)
  })
  .catch((err)=>{
    console.log(err);
  })

},[activeTeacher])


  return(

    <>
    <div className="details-modal-container">
      <div className="details-modal-container-inner">
      <div className="details-modal-header">
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div className="header-section-left">
            <div>
              <h2 style={{ textAlign: "left" }}>
                {activeTeacher.firstName} {activeTeacher.lastName}
              </h2>
            </div>
            <div style={{ textAlign: "left" }}>
              Email: {activeTeacher.email}
            </div>
            <div></div>
          </div>
          <div className="header-section-center">
            <TeacherProfileIncidentsByStudentTable writeUps={teacherProfileData} />
          </div>
          <div className="header-section-center">
            <TeacherProfileIncidentByStudentPieChart writeUps={teacherProfileData} />
          </div>
          <div className="header-section-right">
            <TeacherProfileSpotter teacher={activeTeacher.email} />
          </div>
        </div>
      </div>

      {data ? (
        <div style={{ height: "300px" }} className="modal-body-student">
          <TableContainer
            style={{ height: "250px", backgroundColor: "white" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "25%" }}>Status</TableCell>
                  <TableCell style={{ width: "25%" }}>
                    Description
                  </TableCell>
                  <TableCell style={{ width: "25%" }}>Date</TableCell>
                  <TableCell style={{ width: "25%" }}>
                    Infraction
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teacherProfileData.map((teacher, index) => (
                  <TableRow
                    style={{
                      background: index % 2 === 0 ? "lightgrey" : "white",
                    }}
                    key={index}
                  >
                    <TableCell style={{ width: "25%" }}>
                      {/* {teacher.status} */}
                    </TableCell>
                    <TableCell style={{ width: "25%" }}>
                      {/* {teacher.infraction.infractionDescription} */}
                    </TableCell>
                    <TableCell style={{ width: "25%" }}>
                      {/* {teacher.timeCreated} */}
                    </TableCell>
                    <TableCell style={{ width: "25%" }}>
                      {/* {teacher.infraction.infractionName} */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : (
        <div>No Data available</div>
      )}

      <div className="modal-buttons-teacher-profile">
        <button
          onClick={() => {
            setDisplayBoolean(false);
          }}
        >
          Close
        </button>
        <button
          onClick={() => {
            // generatePDF(activeTeacher, teacherProfileData);
          }}
          style={{ backgroundColor: "#CF9FFF" }}
        >
          Print
        </button>
      </div>
    </div>
  </div>
    </>
  )

} 

  