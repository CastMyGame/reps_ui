import { useEffect, useState, useRef } from "react";
import "./teacher_profile_modal_widgets.css";
import { get } from "src/utils/api/api";
import axios from "axios";
import { requireSpotterResults, studentSecurityError } from "src/utils/studentSecurity";
import { baseUrl } from "src/utils/jsonData";
import { Student } from "src/types/school";

interface TeacherSpotterProps {
  teacher: string;
  setDisplaySpotterAdd: (value: boolean) => void;
  displaySpotterAdd: boolean;
}
export const TeacherProfileSpotter: React.FC<TeacherSpotterProps> = ({
  teacher,
  setDisplaySpotterAdd,
  displaySpotterAdd,
}) => {
  const inFlight = useRef(false);
  const [error, setError] = useState("");
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const result: Student[] = await get("student/v1/allStudents");
        const filteredResults = result.filter((x) =>
          x.spotters?.some(email => email.toLowerCase() === teacher.toLowerCase())
        );

        setStudentData(filteredResults);
      } catch (err) {
        console.error("Error Fetching Data: ", err);
      }
    };

    fetchStudentData();
  }, [update, setDisplaySpotterAdd, teacher, displaySpotterAdd]);

  const removeSpotter = (x: Student) => {
    if (inFlight.current) return;
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const userConfirmed = window.confirm(
      `Do you want to remove ${teacher} from spotting ${x.firstName} ${x.lastName}?`
    );
    if (userConfirmed) {
      inFlight.current = true; setError("");
      axios
        .put(
          `${baseUrl}/student/v1/remove-spotter/${teacher}`,
          x, // Passing `x` as the request data
          { headers } // Passing headers in the configuration object
        )
        .then((response) => {
          requireSpotterResults([response.data], [x.studentEmail], teacher, false);
          window.alert(
            `${teacher} is no longer subscribed for ${x.firstName} ${x.lastName}`
          );
          setUpdate((prev) => !prev);
        })
        .catch((failure) => { setError(studentSecurityError(failure)); })
        .finally(() => { inFlight.current = false; });
    } else {
      // User clicked "Cancel" (No)
    }
  };

  return (
    <div className="widget-container">
      <h2 style={{ textAlign: "center" }}>Spotters Roster</h2>
      {error && <p role="alert">{error}</p>}
      <div className="spotter-pill-container">
        {studentData.map((x) => {
          return (
            <div
              onClick={() => removeSpotter(x)}
              className="spotter-pill"
              key={x.studentEmail}
            >
              {x.firstName}
              <div className="remove-x">x</div>
            </div>
          );
        })}
        <div
          style={{ backgroundColor: "blue", color: "white" }}
          className="spotter-pill"
          onClick={() => setDisplaySpotterAdd(true)}
        >
          {" "}
          + Add New
        </div>
      </div>
    </div>
  );
};
