import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { DropdownOption } from "src/types/menus";
import { Student } from "src/types/school";
import { baseUrl } from "src/utils/jsonData";

export function ManageSpotters(students = []) {
  const [spotStudents, setSpotStudents] = useState([]);
  const [selectedOption, setSelectedOption] = useState([]);
  const [filter, setFilter] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<DropdownOption[]>([]);

  const handleCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>,
    item: DropdownOption
  ) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(
        selectedItems.filter(
          (selectedItem) => selectedItem.value !== item.value
        )
      );
    }
  };

  useEffect(() => {
    setSpotStudents(students);
  }, [students]);

  const selectOptions = Object.values(spotStudents).map((student: Student) => ({
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
    value: student.studentEmail, // Use a unique value for each option
    
  }));

  const handleChange = (selectedOption: any) => {
    setSelectedOption(selectedOption)
  }

  const handleFilter = (event: any) => {
    setFilter(event.target.value);
  };

  const addSpotter = () => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const payload = {
      spotters: [sessionStorage.getItem("email")],
      studentEmail: [selectedOption],
    };

    const url = `${baseUrl}/student/v1/addAsSpotter`;
    axios
      .put(url, payload, { headers })
      .then((response) => {
        window.alert(
          `You have been successfully added as a spotter for: ${selectedOption} `
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
                    (selectedItem) => selectedItem.value === item.value
                  )}
                  onChange={(event) => handleCheckboxChange(event, item)}
                />
              }
              label={item.value}
            />
          ))}
        </FormGroup>
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
