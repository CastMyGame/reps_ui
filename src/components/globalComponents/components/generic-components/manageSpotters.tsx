import { Autocomplete, Checkbox, Chip, FormControlLabel, FormGroup, TextField } from "@mui/material";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { StudentDataDTO } from "src/types/menus";
import { baseUrl } from "src/utils/jsonData";

export function ManageSpotters(students = []) {
  const [spotStudents, setSpotStudents] = useState<StudentDataDTO[]>([]);
  const [selectedOption, setSelectedOption] = useState([]);
  const [filter, setFilter] = useState<string>("");
  // const [selectedItems, setSelectedItems] = useState<StudentDataDTO[]>([]);

  // const handleCheckboxChange = (
  //   event: ChangeEvent<HTMLInputElement>,
  //   item: StudentDataDTO
  // ) => {
  //   if (event.target.checked) {
  //     setSelectedItems([...selectedItems, item]);
  //   } else {
  //     setSelectedItems(
  //       selectedItems.filter(
  //         (selectedItem) => selectedItem.studentEmail !== item.studentEmail
  //       )
  //     );
  //   }
  // };

  useEffect(() => {
    setSpotStudents(students);
  }, [students]);

  // const selectOptions = Object.values(spotStudents).map((student: StudentDataDTO) => ({
  //   studentName: `${student.studentName} - ${student.studentEmail}`, // Display student's full name as the label
  //   studentEmail: student.studentEmail, // Use a unique value for each option
  // }));

  const handleChange = (selectedOption: any) => {
    setSelectedOption(selectedOption);
  };

  // const handleFilter = (event: any) => {
  //   setFilter(event.target.value);
  // };

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
      <div className="mapped-items">
        <Autocomplete
          multiple
          className="student-dropdown"
          id="demo-multiple-chip"
          value={selectedOption}
          onChange={(event, newValue) => handleChange(newValue)}
          options={spotStudents}
          getOptionLabel={(option) => option.studentName}
          renderInput={(params) => (
            <TextField
              {...params}
              className="student-dropdown"
              label="Select Students"
              sx={{ width: "100%" }}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.studentName}
                sx={{ fontSize: 18 }}
                {...getTagProps({ index })}
              />
            ))
          }
        />
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
