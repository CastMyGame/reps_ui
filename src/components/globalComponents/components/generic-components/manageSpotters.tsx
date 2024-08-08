import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { DropdownOption, StudentDataDTO } from "src/types/menus";
import { baseUrl } from "src/utils/jsonData";

export function ManageSpotters(students = []) {
  const [spotStudents, setSpotStudents] = useState<StudentDataDTO[]>([]);
  const [selectedOption, setSelectedOption] = useState([]);
  const [filter, setFilter] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<StudentDataDTO[]>([]);

  const handleCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>,
    item: StudentDataDTO
  ) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(
        selectedItems.filter(
          (selectedItem) => selectedItem.studentEmail !== item.studentEmail
        )
      );
    }
  };

  useEffect(() => {
    setSpotStudents(students);
  }, [students]);

  const selectOptions = Object.values(spotStudents).map((student: StudentDataDTO) => ({
    studentName: `${student.studentName} - ${student.studentEmail}`, // Display student's full name as the label
    studentEmail: student.studentEmail, // Use a unique value for each option
  }));

  const handleChange = (selectedOption: any) => {
    setSelectedOption(selectedOption);
  };

  const handleFilter = (event: any) => {
    setFilter(event.target.value);
  };

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const payload = {
    spotters: [sessionStorage.getItem("email")],
    studentEmail: selectedOption,
  };

  const addSpotter = () => {
    const url = `${baseUrl}/student/v1/addAsSpotter`;
    axios
      .put(url, payload, { headers })
      .then((response) => {
        window.alert(
          `You have been successfully added as a spotter for the students entered. You will receive all REPS emails for these students when they are sent. `
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const removeSpotter = () => {
    const url = `${baseUrl}/student/v1/removeAsSpotter`;
    axios
      .put(url, payload, { headers })
      .then((response) => {
        window.alert(
          `You have been successfully removed as a spotter for the students entered. You will no longer receive REPS emails for these students. `
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <input
        placeholder=" search..."
        className="search-bar-resources"
        onChange={handleFilter}
      />
      <div className="mapped-items">
        <FormGroup>
          {selectOptions.map((item, index) => (
            <FormControlLabel
              key={index}
              style={{ color: "black" }}
              control={
                <Checkbox
                  checked={selectedItems.some(
                    (selectedItem) => selectedItem.studentEmail === item.studentEmail
                  )}
                  onChange={(event) => handleCheckboxChange(event, item)}
                />
              }
              label={item.studentName}
            />
          ))}
        </FormGroup>
        <button onClick={addSpotter}>Spot Students</button>
        <button onClick={removeSpotter}>Remove Spot for Students</button>
      </div>
      {/* <Multiselect
        selectedValues={handleChange}
        options={selectOptions}
        onSelect={addSpotter}
        displayValue="Students"
      ></Multiselect> */}
      {/* <input type="email" placeholder="Enter Student Email" />
      <button type="submit" onClick={addSpotter}>
        Spot Student
      </button> */}
    </div>
  );
}
