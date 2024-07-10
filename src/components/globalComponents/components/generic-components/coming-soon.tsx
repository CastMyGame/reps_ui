
import React, { useState } from 'react';




  interface PageProps{
    title: string;

  }




  const ComingSoon: React.FC<PageProps> = ({ title  }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState("");

   

    
    return (
        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '10px 10px',
            height: '80vh',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          <div
            style={{
              alignSelf: 'center',
              position: 'absolute',
              backgroundColor: 'grey',
              width: '300px',
              height: '380px',
              padding: '10px 10px',
              transform: 'skew(-.312rad)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 0 // Lower z-index to place it behind
            }}
          ></div>
          <div
            style={{
              alignSelf: 'center',
              position: 'relative',
              backgroundColor: 'lightblue',
              width: '300px',
              height: '70px',
              padding: '10px 10px 10px 10px',
              transform: 'skew(-.312rad)',
              zIndex: 1 // Higher z-index to place it in front
            }}
          >
            <h1
              style={{
                transform: 'skew(.312rad)',
                zIndex: 2 // Highest z-index to place the text in front
              }}
            >
              Coming Soon
            </h1>
          </div>
          <h2 style={{ zIndex: 2 }}>{title}</h2>
          <div>
            <img style={{ position:"relative",width: '150px', zIndex: 2,marginTop:"50px" }} src="/RocketReps.png" alt="Rocket Reps" />
          </div>
        </div>
      );
      };
    
        



export default ComingSoon;
