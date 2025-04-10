import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../utils/jsonData";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Autocomplete, Box, CircularProgress } from "@mui/material";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import { AdminOverviewDto, TeacherOverviewDto } from "src/types/responses";
import {
  OfficeReferralPayload,
  Student,
  StudentOption,
} from "src/types/school";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(
  name: string,
  theme: any,
  studentNames: { value: string; label: string }[] = []
) {
  if (!Array.isArray(studentNames)) {
    console.error("studentNames is not an array:", studentNames);
    return { fontWeight: theme.typography.fontWeightRegular };
  }

  const studentValues = studentNames.map((student) => student.value); // Extract values
  return {
    fontWeight: studentValues.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MuiAlert>
>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface CreateOfficeProps {
  data: TeacherOverviewDto | AdminOverviewDto;
}

const CreateOfficeReferralPanel: React.FC<CreateOfficeProps> = ({ data }) => {
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);
  const [infractionTypeSelected, setInfractionTypeSelected] = useState<
    string | null
  >(null);
  const [infractionPeriodSelected, setInfractionPeriodSelected] = useState<
    string | null
  >(null);
  const [teacherEmailSelected, setTeacherEmailSelected] = useState<
    string | null
  >(null);
  const [infractionDescriptionSelected, setInfractionDescriptionSelected] =
    useState("");
  const [toast, setToast] = useState({ display: false, message: "" });
  const [studentNames, setStudentNames] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
    buttonType: "",
  });

  let storageEmail = sessionStorage.getItem("email");

  useEffect(() => {
    if (storageEmail) {
      setTeacherEmailSelected(storageEmail);
    }
  }, [storageEmail]);

  const [currency, setCurrency] = useState<number>(0);

  const defaultTheme = createTheme();

  const infractionPeriodSelectOptions = [
    { value: "exchange", label: "Class Exchange" },
    { value: "afterSchool", label: "After School" },
    { value: "lunch", label: "Lunch" },
    { value: "block1", label: "Block 1" },
    { value: "block2", label: "Block 2" },
    { value: "block3", label: "Block 3" },
    { value: "block4", label: "Block 4" },
    { value: "period1", label: "Period 1" },
    { value: "period2", label: "Period 2" },
    { value: "period3", label: "Period 3" },
    { value: "period4", label: "Period 4" },
    { value: "period5", label: "Period 5" },
    { value: "period6", label: "Period 6" },
    { value: "period7", label: "Period 7" },
    { value: "period8", label: "Period 8" },
    { value: "period9", label: "Period 9" },
  ];

  const referralSelectOptions = [
    { value: "100 - Fighting", label: "100 - Fighting" },
    { value: "200 - Assault", label: "200 - Assault" },
    {
      value: "300 - Indecent Exposure",
      label: "300 - Indecent Exposure",
    },
  ] as const;

  const url = `${baseUrl}/student/v1/allStudents`; // Replace with your actual API endpoint

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setListOfStudents(response.data || []);
      })
      .catch(function (error) {
        console.error(error);
        setListOfStudents([]);
      });
  }, [url]);

  const selectOptions = (listOfStudents || []).map((student) => ({
    value: student.studentEmail, // Use a unique value for each option
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
  }));

  const getPhoneNumber = (email: string) => {
    if (email != null) {
      const result = (listOfStudents || []).filter(
        (student) => (student.studentEmail = email)
      );
      return result[0]?.parentPhoneNumber || "";
    } else {
      return "";
    }
  };

  const resetForm = () => {
    setStudentNames([]);
    setInfractionPeriodSelected(null);
    setInfractionTypeSelected(null);
    setInfractionDescriptionSelected("");
  };

  //Mapping selected students pushing indivdual payloads to post
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    event.preventDefault();
    setLoading(true);
    setOpenModal({ display: false, message: "", buttonType: "" });
    const payloadContent: OfficeReferralPayload[] = [];
    studentNames.forEach((student) => {
      let referralCode = { codeKey: 0, codeName: "" };

      if (infractionTypeSelected) {
        const [key, name] = infractionTypeSelected.split("-");
        referralCode = {
          codeKey: Number(key ?? 0),
          codeName: name ?? "",
        };
      }

      const studentPayload: OfficeReferralPayload = {
        studentEmail: student.value ?? "",
        teacherEmail: teacherEmailSelected ?? "",
        classPeriod: infractionPeriodSelected ?? "",
        referralCode: referralCode,
        referralDescription: infractionDescriptionSelected ?? "",
        currency: currency ?? 0,
      };
      payloadContent.push(studentPayload);
      return payloadContent;
    });

    const payload = payloadContent;

    axios
      .post(`${baseUrl}/officeReferral/v1/startPunish/adminReferral`, payload, {
        headers: headers,
      })
      .then(function (res) {
        setToast({ display: true, message: "Referral Succesfuly Created" });
        setTimeout(() => {
          setLoading(false);
          setToast({ display: false, message: "" });
        }, 1000);
        resetForm();
        setInfractionDescriptionSelected("");
      })
      .catch(function (error) {
        console.error(error);
        setToast({ display: true, message: "Something Went Wrong" });
        setTimeout(() => {
          setLoading(false);
          setToast({ display: false, message: "" });
        }, 2000);
      });
  };

  const handleInfractionPeriodChange = (
    event: SelectChangeEvent<string | null>
  ) => {
    setInfractionPeriodSelected(event.target.value);
  };

  const handleInfractionTypeChange = (
    event: SelectChangeEvent<string | null>
  ) => {
    setInfractionTypeSelected(event.target.value);
  };

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredValue = Number(event.target.value);
    // Check if the entered value is greater than or equal to the minimum value
    if (enteredValue >= 0) {
      // Fix this to display toast if difference is negative

      if (difference < 0) {
        setToast({
          display: true,
          message:
            "You do not have enough currency to give out that much please change your amount",
        });
        setTimeout(() => {
          setLoading(false);
          setToast({ display: false, message: "" });
        }, 2000);
        setCurrency(0);
      } else {
        setCurrency(enteredValue); // Update the state if it meets the validation criteria
      }
    } else {
      // Optionally, you can show an error message or handle the invalid input in some way
      console.log("Invalid input: Value must be greater than or equal to 0");
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setToast({ display: false, message: "" });
  };

  let difference =
    (data?.teacher?.currency ?? 0) -
    currency * (studentNames.length ? studentNames.length : 0);

  return (
    <>
      {toast.display === true && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={toast.display}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      )}
      {openModal.display && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{openModal.message}</h3>
            </div>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setOpenModal({ display: false, message: "", buttonType: "" });
                }}
              >
                Cancel
              </button>
              {openModal.buttonType === "submit" && (
                <form onSubmit={handleSubmit}>
                  <Button
                    disabled={
                      !infractionPeriodSelected ||
                      !infractionTypeSelected ||
                      !infractionDescriptionSelected ||
                      studentNames.length === 0 ||
                      difference < 0
                    }
                    type="submit"
                    variant="contained"
                    sx={{ height: "100%", width: "100%" }} // Set explicit height
                  >
                    Submit
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="form-referral">
        {loading && (
          <div
            style={{
              position: "absolute", // Position the div absolutely
              top: "64%", // Center vertically
              left: "60%", // Center horizontally
              transform: "translate(-50%, -50%)", // Adjust to perfectly center the div
              backgroundColor: "rgba(255, 255, 255, 0.9)", // Optional: Add background color or opacity
            }}
          >
            <CircularProgress style={{}} color="secondary" />
          </div>
        )}
        <ThemeProvider theme={defaultTheme}>
          <Container component="main">
            <CssBaseline />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ mt: 1 }}
              >
                <h4>Submitting Teacher: {teacherEmailSelected}</h4>
                <hr />

                <Autocomplete
                  multiple
                  className="student-dropdown"
                  id="demo-multiple-chip"
                  value={studentNames}
                  onChange={(event, newValue) => setStudentNames(newValue)}
                  options={selectOptions} // Pass the selectOptions array here
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="student-dropdown"
                      InputLabelProps={{ style: { fontSize: 18 } }}
                      label="Select Students"
                      sx={{ width: "100%" }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.label}
                        sx={{ fontSize: 18 }}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
                <div style={{ height: "5px" }}></div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                  }}
                >
                  <div style={{ width: "50%" }}>
                    <InputLabel id="infractionPeriod" style={{ fontSize: 24 }}>
                      Class Period
                    </InputLabel>

                    <Select
                      sx={{ width: "100%", fontSize: 18 }}
                      labelId="infractionPeriod"
                      value={infractionPeriodSelected}
                      onChange={handleInfractionPeriodChange}
                      renderValue={(selected) => {
                        // Check if selected is an array, if not, wrap it in an array
                        const selectedArray = Array.isArray(selected)
                          ? selected
                          : [selected];

                        return (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {selectedArray.map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                sx={{ fontSize: 18 }}
                              />
                            ))}
                          </Box>
                        );
                      }}
                      MenuProps={MenuProps}
                    >
                      {infractionPeriodSelectOptions.map((name) => (
                        <MenuItem
                          key={name.value}
                          value={name.value}
                          sx={{ fontSize: 18 }}
                        >
                          {name.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div
                    style={{ width: "50%", marginLeft: "10px", fontSize: 18 }}
                  >
                    <InputLabel id="infractionType" style={{ fontSize: 24 }}>
                      Infraction Type
                    </InputLabel>

                    <Select
                      sx={{ width: "100%" }}
                      labelId="infractionType"
                      value={infractionTypeSelected}
                      onChange={handleInfractionTypeChange}
                      renderValue={(selected) => {
                        // Check if selected is an array, if not, wrap it in an array
                        const selectedArray = Array.isArray(selected)
                          ? selected
                          : [selected];

                        return (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {selectedArray.map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                sx={{ fontSize: 18 }}
                              />
                            ))}
                          </Box>
                        );
                      }}
                      MenuProps={MenuProps}
                    >
                      {referralSelectOptions.map((name) => (
                        <MenuItem
                          key={name.value}
                          value={name.value}
                          style={getStyles(
                            name.value,
                            defaultTheme,
                            studentNames
                          )}
                          sx={{ fontSize: 18 }}
                        >
                          {name.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="question-container-text-area">
                  <p style={{ fontSize: 24 }}>
                    Description of Behavior/Event. This will be sent directly to
                    the student and guardian so be sure to provide accurate and
                    objective facts as well as do NOT include the names of any
                    other students.
                  </p>
                </div>
                <div>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    multiline
                    minRows={2} // Optional: Set minimum number of rows
                    onChange={(event) => {
                      const enteredValue = event.target.value;
                      setInfractionDescriptionSelected(enteredValue);
                    }}
                    id="offenseDescription"
                    label="Brief Infraction Description"
                    name="offenseDescription"
                    autoFocus
                    value={infractionDescriptionSelected}
                    inputProps={{ style: { fontSize: 15 }, min: 0 }} // font size of input text
                    InputLabelProps={{
                      sx: {
                        "&.Mui-focused": {
                          color: "white",
                          marginTop: "-10px",
                        },
                      },
                    }}
                    sx={{ fontSize: 40 }} // Increase the font size of the input text
                    onKeyDown={(e) => {
                      const target = e.target as HTMLTextAreaElement;

                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevent form submission on Enter key

                        // Get the current cursor position
                        const { selectionStart, selectionEnd } = target;

                        // Get the current value of the input
                        const value = target.value;

                        // Insert a newline character (\n) at the cursor position
                        const newValue =
                          value.substring(0, selectionStart) +
                          "\n" +
                          value.substring(selectionEnd);

                        // Update the input value and set the cursor position after the newline character
                        target.value = newValue;
                        target.selectionStart = target.selectionEnd =
                          selectionStart + 1;

                        // Trigger the change event manually (React doesn't update the value automatically)
                        const event = new Event("input", { bubbles: true });
                        e.target.dispatchEvent(event);

                        // Optionally, you can add your logic here for what should happen after Enter is pressed.
                      }
                    }}
                  />
                </div>
                {/* <br/> */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                  }}
                  className="button-container"
                >
                  <div style={{ width: "30%" }}>
                    <Button
                      type="reset"
                      fullWidth
                      variant="contained"
                      onClick={() => {
                        resetForm();
                      }}
                      sx={{
                        height: "100%",
                        backgroundColor: "grey",
                        fontSize: 16,
                        "&:hover": {
                          backgroundColor: "red", // Darken the color on hover if desired
                        },
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                  <div style={{ width: "70%" }}>
                    {studentNames.length > 1 ? (
                      <Button
                        disabled={
                          !infractionPeriodSelected ||
                          !infractionTypeSelected ||
                          !infractionDescriptionSelected ||
                          studentNames.length === 0 ||
                          difference < 0
                        }
                        onClick={() => {
                          setOpenModal({
                            display: true,
                            message:
                              "Warning! You are currently writing up multiple students simultaneously. If this is your intent make sure you have not included any student identifiers including names or pronouns. If you wish to continue press Submit, to go back press cancel.",
                            buttonType: "submit",
                          });
                        }}
                        fullWidth
                        variant="contained"
                        sx={{ height: "100%", fontSize: 18 }} // Set explicit height
                      >
                        Submit Multiple
                      </Button>
                    ) : (
                      <Button
                        disabled={
                          !infractionPeriodSelected ||
                          !infractionTypeSelected ||
                          !infractionDescriptionSelected ||
                          studentNames.length === 0 ||
                          difference < 0
                        }
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                          height: "100%",
                          "&:hover": {
                            backgroundColor: "blue", // Darken the color on hover if desired
                            fontSize: 16,
                          },
                        }} // Set explicit height
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              </Box>
            </Box>
          </Container>
        </ThemeProvider>
        :
      </div>
    </>
  );
};
export default CreateOfficeReferralPanel;
