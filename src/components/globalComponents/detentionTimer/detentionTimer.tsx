import React, { useState, useEffect } from "react";
import { DetentionTimerProps, TimeBank } from "src/types/school";
import { baseUrl } from "src/utils/jsonData";

const DetentionTimer: React.FC<DetentionTimerProps> = ({ studentEmail }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false); // Tracks if the timer is running
  const [timeBank, setTimeBank] = useState<TimeBank>({ hours: 0, minutes: 0 }); // TimeBank to track hours and minutes
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // Stores the interval ID

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  // This effect runs the timer when it's started
  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => {
        setTimeBank((prevTimeBank) => {
          const newMinutes = prevTimeBank.minutes + 1;
          const newHours = prevTimeBank.hours + Math.floor(newMinutes / 60);

          return {
            hours: newHours,
            minutes: newMinutes % 60,
          };
        });
      }, 60000); // Update every minute

      setIntervalId(id); // Store interval ID for cleanup

      return () => clearInterval(id); // Cleanup the interval on component unmount
    }
  }, [isRunning]);

  // Function to handle the button click
  const handleButtonClick = async () => {
    if (isRunning) {
      // Timer is stopping, send the time to the backend
      if (intervalId) clearInterval(intervalId);
      setIsRunning(false);
      await sendTimeToBackend(timeBank.hours, timeBank.minutes); // Send the accumulated hours and minutes
    } else {
      // Timer is starting, reset the time and start the interval
      setTimeBank({ hours: 0, minutes: 0 });
      setIsRunning(true);
    }
  };

  // Function to send time to the backend
  const sendTimeToBackend = async (hours: number, minutes: number) => {
    try {
      const response = await fetch(
        `${baseUrl}/student/v1/${studentEmail}/add-time?hours=${hours}&minutes=${minutes}`,
        {
          method: "POST",
          headers: headers,
        }
      );

      if (response.ok) {
        console.log("Time successfully sent to the backend");
      } else {
        console.error("Error sending time to the backend");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <p>
        Time: {timeBank.hours}h {timeBank.minutes}m
      </p>
      <button onClick={handleButtonClick}>
        {isRunning ? "Stop and Send Time" : "Start Timer"}
      </button>
    </div>
  );
};

export default DetentionTimer;
