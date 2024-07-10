
import React, { useState } from 'react';




  interface PageProps{
    title: string;

  }




  const ComingSoon: React.FC<PageProps> = ({ title  }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState("");

   

    
        return (
          <div style={{textAlign:"center",backgroundColor:"white", padding:"10px 10px",height:"80vh",justifyContent:"center",display:"flex", flexDirection:"column"}}>
            <h1>Coming Soon</h1>
            <h2>{title}</h2>
            <div >
                <img style={{width:"20%"}} src="/RocketReps.png"/>
          </div>
          </div>
        );
      };
    
        



export default ComingSoon;
