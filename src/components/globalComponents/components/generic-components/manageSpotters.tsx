import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import axios from "axios";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { StudentDataDTO } from "src/types/menus";
import { baseUrl } from "src/utils/jsonData";

export function ManageSpotters() {
  const [selectOption, setSelectOption] = useState<any>();
  const [filteredOptions, setFilteredOptions] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Happends on load
  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    axios.get(`${baseUrl}/student/v1/allStudents`, { headers }).then((res) => {
      setSelectOption(res.data);
    });
  }, []);

  console.log(filteredOptions);

  const useOnClickOutside = (ref: any, handler: any) => {
    useEffect(() => {
      const listener = (event: { target: any; }) => {
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };

      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);

      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    }, [ref, handler]);
  }

  const ref = useRef();
  useOnClickOutside(ref, () => setShowDropdown(false))

  const handleChange = (event: any) => {
    console.log(selectOption);
    const value = event.target.value;
    setSearchTerm(value);

    // Filter options based on search term
    const filtered = selectOption.filter((item: any) =>
      item.firstName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
    setShowDropdown(true);
  };

  // const selectOptions = Object.values(spotStudents).map((student: StudentDataDTO) => ({
  //   studentName: `${student.studentName} - ${student.studentEmail}`, // Display student's full name as the label
  //   studentEmail: student.studentEmail, // Use a unique value for each option
  // }));

  useEffect(() => {
    console.log(selectedItems);
  }, [selectedItems]);

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const addSpotter = () => {
    const student_emails: any = [];
    selectOption.map((x: any) => {
      student_emails.push(x.studentEmail);
    });

    const payload = {
      spotters: [sessionStorage.getItem("email")],
      studentEmail: student_emails,
    };

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
    const student_emails: any = [];
    selectOption.map((x: any) => {
      student_emails.push(x.studentEmail);
    });

    const payload = {
      spotters: [sessionStorage.getItem("email")],
      studentEmail: student_emails,
    };
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
      <button onClick={addSpotter}>Spot Students</button>
      <button onClick={removeSpotter}>Remove Spot for Students</button>
      <input
        placeholder="Search..."
        className="search-bar-resources"
        value={searchTerm}
        onChange={handleChange}
      />
      <div className="mapped-items">
        {(filteredOptions.length > 0 && showDropdown) && (
          <FormGroup>
            {filteredOptions.map((item: any, index: number) => (
              <FormControlLabel
                key={index}
                style={{ color: "black" }}
                control={
                  <Checkbox
                    checked={selectedItems.some(
                      (selectedItem) =>
                        selectedItem.studentEmail === item.studentEmail
                    )}
                    onChange={(event) => handleCheckboxChange(event, item)}
                  />
                }
                label={`${item.firstName} ${item.lastName}`}
              />
            ))}
          </FormGroup>
        )}
      </div>
    </div>
  );
  {
    /* <Select
  multiple={true}
  onChange={handleChange}
  onSelect={addSpotter}
  value={selectedItems}
>
  {selectOptions.map((x) => (
    <option key={x.studentEmail} value={x.studentEmail}>
      {x.studentName} - {x.studentEmail}
    </option>
  ))}
</Select> */
  }
  {
    /* <input type="email" placeholder="Enter Student Email" />
      <button type="submit" onClick={addSpotter}>
        Spot Student
      </button> */
  }
}
