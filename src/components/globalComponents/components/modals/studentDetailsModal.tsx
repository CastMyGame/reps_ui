import { useCallback, useEffect, useState } from "react";
import "./studentDetailsModal.css"
import { get } from "src/utils/api/api";
import NotesComponent from "../../modals/notes/notes";
import GuidanceRequestModal from "../../modals/requestModal/guidanceRequestModal";


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
    points:number
    
}

export const StudentDetailsModal:React.FC<StudentDetailsModalProps> = ({studentEmail,setDisplayModal}) =>{
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
          }, []);

    

    useEffect(()=>{
        fetchPunishmentData();
        fetchStudentData()
    },[fetchPunishmentData,fetchStudentData])




    return(
        <div className="student-details-modal">
               { noteModal &&  <NotesComponent
               activeTask="23456"
               setDisplayModal={setNoteModal}
               setUpdatePage={setUpdatePage}

               /> }
                   { requestModal &&  <GuidanceRequestModal
               activeTask="23456"
               setDisplayModal={setRequestModal}
               setUpdatePage={setUpdatePage}

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
                <div onClick={setDisplayModal(false)}>[X]</div>

             
                                        
                           
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
                         
                {      [1,2,3,4,5].map(index =>{

return(
    <div className="thread-card" key={index}>
    <p>Event: Sample</p>
    <p>Date: 01/23/24</p>
    <p>Content: Samples </p>
    </div>


)
}) }  
         </div>   
       




                </div>


<div className="sdm-button-container">
        <button onClick={()=> setNoteModal(true)}>Notes</button>
        <button onClick={()=>setRequestModal(true)}>Guidance Request</button>
</div>        
                  
            

                 
           
        

        </div>
    )
}