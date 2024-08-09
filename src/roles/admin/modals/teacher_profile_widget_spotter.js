import { useEffect, useState } from 'react';
import './teacher_profile_modal_widgets.css'
import { get } from 'src/utils/api/api';
export const TeacherProfileSpotter = ({teacher}) => {

  console.log("find",teacher)
  const [studentData,setStudentData] = useState()


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
    
  }, []);





  return (
    <>
      <div className="widget-container">
        <h2 style={{textAlign:"center"}}>Spotters Roster</h2>
        <div className='spotter-pill-container'>
          {studentData && studentData.map((x)=>{
            return(
              <>
              <div className='spotter-pill'>{x.firstName}</div>
              </>
            )
          })}

        </div>



        
   
      </div>
    </>
  );
};