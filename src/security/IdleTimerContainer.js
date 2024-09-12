import React, { useRef, useState, useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useNavigate } from 'react-router-dom';

export default function IdleComponent() {
  const navigate = useNavigate();
  const idleTimeRef = useRef(null);
  const [showNotification, setShowNotification] = useState(false);

  const onIdle = () => {
    // Clear all sessionStorage
    sessionStorage.clear();
    navigate('/login');
  };

  // const handleKeepSession = () => {
  //   if (idleTimeRef.current) {
  //     idleTimeRef.current.reset(); // Reset the idle timer
  //   }
  //   setShowNotification(false);
  //   startNotificationInterval(); // Restart the notification interval
  // };

//   const startNotificationInterval = () => {
//     // Show notification every minute
//     setInterval(() => {
//       setShowNotification(true);
//     }, (5 * 60 - 1) * 1000); // Show notification 1 minute before expiration
// };


  // useEffect(() => {
  //   startNotificationInterval(); // Initial start

  //   // Clear the interval when the component is unmounted
  //   return () => {
  //     clearInterval();
  //   };
  // }, []);

  const idleTimer = useIdleTimer({
    crossTab: true,
    ref: idleTimeRef,
    timeout: 15* 60 * 1000, // Ten minutes
    onIdle: onIdle,
  });





  return (
    <div>
      {/* {showNotification && (
        <div>
          Your session will expire in 1 minute. Do you want to keep it?
          <button onClick={handleKeepSession}>Keep Session</button>
        </div>
      )} */}
      {/* You can add more content or styling as needed */}
    </div>
  );
}
