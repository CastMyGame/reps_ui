import React,{ useCallback, useEffect, useState } from "react";
import "./studentDetailsModal.css"
import { get } from "../../../../utils/api/api";
import NotesComponent from "../../modals/notes/notes";
import GuidanceRequestModal from "../../modals/requestModal/guidanceRequestModal";



interface EventThreadObj{
    event: string;
    date: string;
    content:string;
}

interface StudentDetailsModalProps {
    studentEmail:string;
    setDisplayModal:any
}

interface StudentReferralObj {
    infractionName:string;
    status:string;
    teacherEmail:string,
    infractionDescription:string[];
    timeCreated:any

}

interface studentObj{
    firstName:string |undefined;
    lastName:string|undefined;
    studentIdNumber:string|undefined;
    grade:string|undefined;
    parentPhoneNumber:string|undefined; 
    studentPhoneNumber:string|undefined;
    points:number;
    notesArray:[EventThreadObj]
    
}

export const StudentDetailsModal:React.FC<StudentDetailsModalProps> = ({studentEmail,setDisplayModal}) =>{
    console.log(studentEmail)
    const [data,setData] = useState([])
    const [studentData,setStudentData] = useState<studentObj>()
    const [noteModal,setNoteModal] = useState<boolean>(false)
    const [requestModal,setRequestModal] = useState<boolean>(false)
    
    const [updatePage,setUpdatePage] = useState<boolean>(false)



        const fetchPunishmentData = useCallback(async () => {

            try {
              const result = await get(
                `punish/v1/student/punishments/${studentEmail}`
              );                setData(result)
            
            } catch (err) {
              console.error("Error Fetching Data: ", err);
            }
          }, []);

          const fetchStudentData = useCallback(async () => {
            try {
              const result = await get(
                `student/v1/email/${studentEmail}`
              );                setStudentData(result)
            
            } catch (err) {
              console.error("Error Fetching Data: ", err);
            }
          }, [updatePage]);

    

    useEffect(()=>{
        fetchPunishmentData();
        fetchStudentData()
    },[fetchPunishmentData,fetchStudentData])


    console.log(studentData?.notesArray)


    return(
        <div className="student-details-modal">
               { noteModal &&  <NotesComponent
               activeTask={studentData?.studentIdNumber}
               setDisplayModal={setNoteModal}
               setUpdatePage={setUpdatePage}

               /> }
                   { requestModal &&  <GuidanceRequestModal
               activeTask="23456"
               setDisplayModal={setRequestModal}
               setUpdatePage={setUpdatePage}
               studentEmail = {studentEmail}

               /> }

            <div className="sdm-header">
                <div className="sdm-title"> <p style={{fontSize:"25px"}}>Student Details</p></div>
                <div className="sdm-student-details">
                <p>ID: {studentData?.studentIdNumber}</p>
                                        <p><span style={{fontWeight:"Bold"}}>Name:</span> {studentData?.firstName} {studentData?.lastName}</p>
                                        <p><span style={{fontWeight:"Bold"}}>Grade:</span> {studentData?.grade}</p>
                                        <p><span style={{fontWeight:"Bold"}}>Student Phone:</span>{studentData?.studentPhoneNumber}</p>
                                        <p><span style={{fontWeight:"Bold"}}>Parent Phone:</span> {studentData?.parentPhoneNumber}</p>
                                        <p><span style={{fontWeight:"Bold"}}>Ponts:</span> {studentData?.points}</p>
                
                                      

                </div>
                <div onClick={()=>setDisplayModal(false)}>[X]</div>

             
                                        
                           
                                      </div>
                 
           
            <div className="sdm-charts">
                 
                 </div>
            <div className="sdm-tables">
                <div className="sdm-table-half">
                    <table >
                        <thead >
                            <th>Date</th>
                            <th>Infraction Name</th>   
                            <th>Description</th>
                            <th>Status</th>
                          

                        </thead>
                        <tbody >
                            {data.map((record:StudentReferralObj,index:number)=>{
                                return(
                                    <tr key={index}>
                                    <td>{record.timeCreated}</td>
                                    <td>{record.infractionName}</td>   
                                    <td>{record.infractionDescription[0]}</td>
                                    <td>{record.status}</td>
                                    </tr>

                                )
                            })}
                          

                        </tbody>

                    </table>

                </div>
                <div style={{padding:"5px 5px",backgroundColor:"tan"}} className="sdm-table-half">
                         

                {  studentData !==undefined &&    studentData?.notesArray.map((item:any ,index:number) =>{
                    console.log(item)

return(
    <div className="thread-card" key={index}>
    <p>Event: {item.event}</p>
    <p>Date: {item.date}</p>
    <p>Content: {item.content} </p>
    </div>


)
}) }  
         </div>   
       




                </div>


<div className="sdm-button-container">
        <button onClick={()=> {
            setNoteModal(true)
            setUpdatePage(prev=>!prev)
            }}>Notes</button>
        <button onClick={()=>setRequestModal(true)}>Guidance Request</button>
</div>        
                  
            

                 
           
        

        </div>
    )
}