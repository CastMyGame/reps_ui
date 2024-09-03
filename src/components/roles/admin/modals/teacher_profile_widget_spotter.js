import { useEffect, useState } from 'react';
import './teacher_profile_modal_widgets.css'
import { get } from 'src/utils/api/api';
import axios from 'axios';
import { baseUrl } from 'src/utils/jsonData';
export const TeacherProfileSpotter = ({teacher, setDisplaySpotterAdd, displaySpotterAdd}) => {

  console.log("find",teacher)
  const [studentData,setStudentData] = useState()
  const [update,setUpdate] = useState(false);


  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const result = await get("student/v1/allStudents");
        const filteredResults = result.filter((x) => x.spotters.includes(teacher));

        setStudentData(filteredResults);
      } catch (err) {
        console.error("Error Fetching Data: ", err);
      }
    };


    fetchStudentData();
    
  }, [update, setDisplaySpotterAdd, teacher,displaySpotterAdd]);

  const RemoveSpotter = (x) => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const userConfirmed = window.confirm(`Do you want to remove ${teacher} from spotting ${x.firstName} ${x.lastName}?`);
if (userConfirmed) {
  axios
  .put(
    `${baseUrl}/student/v1/remove-spotter/${teacher}`,
    x, // Passing `x` as the request data
    { headers } // Passing headers in the configuration object
  )
  .then(() => {
    window.alert(`You have been removed as spotter for ${x.firstName} ${x.lastName}`);
    setUpdate((prev)=>!prev)
  })
  .catch(() => {
    console.log("SOMETHING WENT WRONG");
  });
} else {
  // User clicked "Cancel" (No)
}

  
  
  };




  return (
    <>
      <div className="widget-container">
        <h2 style={{textAlign:"center"}}>Spotters Roster</h2>
        <div className='spotter-pill-container'>
        
            {studentData && studentData.map((x)=>{
            return(
              <>
              <div onClick={()=>RemoveSpotter(x)} className='spotter-pill'>{x.firstName}<div className='remove-x' >x</div></div>
              </>
            )
          })}
          <div style={{backgroundColor:"blue",color:'white'}} className='spotter-pill' onClick={()=> setDisplaySpotterAdd(true)}> + Add New</div>
      
        

        </div>
   
      </div>
    </>
  );
};