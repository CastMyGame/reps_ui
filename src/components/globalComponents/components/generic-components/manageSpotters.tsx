import axios from "axios";
import Multiselect from "multiselect-react-dropdown";
import { useState } from "react";
import { baseUrl } from "src/utils/jsonData";

export function ManageSpotters(students = []) {
  const [spotEmail, setSpotEmail] = useState([]);

  setSpotEmail(students);

  const selectOptions = spotEmail.map((student) => ({
    value: student.studentEmail, // Use a unique value for each option
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
  }));

  const addSpotter = () => {
    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };

      const payload = {
        spotters: [sessionStorage.getItem("email")],
        studentEmail: [spotEmail],
      };

      const url = `${baseUrl}/student/v1/addAsSpotter`;
      axios
        .put(url, payload, { headers })
        .then((response) => {
          window.alert(
            `You have been successfully added as a spotter for: ${spotEmail} `
          );
        })
        .catch((error) => {
          console.error(error);
        });
      }
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Multiselect></Multiselect>
      <input type="email" placeholder="Enter Student Email" />
      <button type="submit" onClick={addSpotter}>
        Spot Student
      </button>
    </div>
  );
}
