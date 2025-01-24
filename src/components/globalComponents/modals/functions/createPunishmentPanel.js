import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../../utils/jsonData";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Autocomplete,
  Box,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import Checkbox from "@mui/material/Checkbox";

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

function getStyles(name, studentNames, theme) {
  return {
    fontWeight:
      studentNames.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const CreatePunishmentPanel = () => {
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [listOfStudents, setListOfStudents] = useState([]);
  const [infractionTypeSelected, setInfractionTypeSelected] = useState("");
  const [infractionPeriodSelected, setInfractionPeriodSelected] = useState("");
  const [teacherEmailSelected, setTeacherEmailSelected] = useState();
  const [infractionDescriptionSelected, setInfractionDescriptionSelected] =
    useState("");
  const [data, setData] = useState([]);
  const [toast, setToast] = useState({ display: false, message: "" });
  const [studentNames, setStudentNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
    buttonType: "",
  });

  useEffect(() => {
    setTeacherEmailSelected(sessionStorage.getItem("email"));
  }, []);

  const [currency, setCurrency] = useState(0);

  const [isGuidance, setIsGuidance] = useState({
    isGuidanceBoolean: false,
    guidanceDescription: "",
  });

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

  const infractionSelectOptions = [
    { value: "Tardy", label: "Tardy" },
    {
      value: "Unauthorized Device/Cell Phone",
      label: "Unauthorized Device/Cell Phone",
    },
    { value: "Disruptive Behavior", label: "Disruptive Behavior" },
    { value: "Horseplay", label: "Horseplay" },
    { value: "Dress Code", label: "Dress Code" },
    {
      value: "Positive Behavior Shout Out!",
      label: "Positive Behavior Shout Out!",
    },
    { value: "Behavioral Concern", label: "Behavioral Concern" },
    { value: "Failure to Complete Work", label: "Failure to Complete Work" },
  ];

  const descriptions = {
    "Failure to Complete Work":
      "Please provide a description of the overdue assignment, its original due date, and include a hyperlink to the assignment if accessible. Additionally, explain the impact the missing assignment is currently having on their overall grade and the points the student can earn by completing the work.",

    "Positive Behavior Shout Out!": "",
  };

  const getDescription = (selectedOption) => {
    return (
      descriptions[selectedOption] ||
      "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."
    );
  };

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  useEffect(() => {
    const url = `${baseUrl}/student/v1/allStudents`; // Replace with your actual API endpoint

    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setListOfStudents(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const url = `${baseUrl}/employees/v1/employees/email/${sessionStorage.getItem("email")}`; // Replace with your actual API endpoint
    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setData(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  const selectOptions = listOfStudents.map((student) => ({
    value: student.studentEmail, // Use a unique value for each option
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
  }));

  const resetForm = () => {
    setStudentNames([]);
    setInfractionPeriodSelected(null);
    setInfractionTypeSelected(null);
    setInfractionDescriptionSelected("");
    setIsGuidance({ isGuidanceBoolean: false, guidanceDescription: "" });
  };

  //Mapping selected students pushing indivdual payloads to post
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setOpenModal({ display: false, message: "" });
    const payloadContent = [];
    studentNames.map((student) => {
      const studentPayload = {
        firstName: "Placeholder 1",
        lastName: "Placeholder 2",
        studentEmail: student.value,
        teacherEmail: teacherEmailSelected,
        infractionPeriod: infractionPeriodSelected,
        infractionName: infractionTypeSelected,
        infractionDescription: infractionDescriptionSelected,
        currency: currency,
        guidanceDescription: isGuidance.guidanceDescription || "",
      };
      payloadContent.push(studentPayload);
      return payloadContent;
    });

    const payload = payloadContent;

    axios
      .post(`${baseUrl}/punish/v1/startPunish/formList`, payload, {
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

  const handleInfractionPeriodChange = (event) => {
    setInfractionPeriodSelected(event.target.value);
  };

  const handleInfractionTypeChange = (event) => {
    setInfractionTypeSelected(event.target.value);
  };

  const handleCurrencyChange = (event) => {
    const enteredValue = event.target.value;
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

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setToast({ display: false, message: "" });
  };

  let difference =
    data.currency - currency * (studentNames.length ? studentNames.length : 0);

  const handleGuidanceChange = (event) => {
    const { name, value } = event.target;
    setIsGuidance((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleGuidanceCheckboxChange = (event) => {
    const { checked } = event.target;
    setIsGuidance((prevState) => ({
      ...prevState,
      isGuidanceBoolean: checked,
    }));
  };

  return (
    <>
      {toast.display === true && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={toast}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          <Alert Close={handleClose} severity="success" sx={{ width: "100%" }}>
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
                  setOpenModal({ display: false, message: "" });
                }}
              >
                Cancel
              </button>
              {openModal.buttonType === "submit" && (
                <Button
                  disabled={
                    !infractionPeriodSelected ||
                    !infractionTypeSelected ||
                    !infractionDescriptionSelected ||
                    studentNames.length === 0 ||
                    difference < 0
                  }
                  type="submit"
                  onClick={handleSubmit}
                  width="50%"
                  variant="contained"
                  sx={{ height: "100%" }} // Set explicit height
                >
                  Submit
                </Button>
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
                  inputLabelProps={{ style: { fontSize: 18 } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="student-dropdown"
                      inputLabelProps={{ style: { fontSize: 18 } }}
                      label="Select Students"
                      sx={{ width: "100%" }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option.value}
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
                      Infraction Type/Positive Shoutout
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
                      {infractionSelectOptions.map((name) => (
                        <MenuItem
                          key={name.value}
                          value={name.value}
                          style={getStyles(name, studentNames, defaultTheme)}
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
                    {infractionTypeSelected === "Failure to Complete Work" ||
                    infractionTypeSelected === "Positive Behavior Shout Out!" ||
                    infractionTypeSelected === "Behavioral Concern"
                      ? getDescription(infractionTypeSelected)
                      : "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts as well as do NOT include the names of any students."}
                  </p>
                  <div>
                    <div className="guidance-box">
                      <FormGroup>
                        <FormControlLabel
                          style={{ color: "black" }}
                          componentsProps={{ typography: { variant: "h4" } }}
                          value="end"
                          labelPlacement="end"
                          control={
                            <Checkbox
                              color="primary"
                              checked={isGuidance.isGuidanceBoolean}
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                              onChange={handleGuidanceCheckboxChange}
                              name="isGuidanceBoolean"
                            />
                          }
                          label="Create Guidance Referral"
                        />
                        {isGuidance.isGuidanceBoolean &&
                          studentNames.length < 2 && (
                            <h4>Description goes here</h4>
                          )}
                      </FormGroup>
                    </div>
                    {infractionTypeSelected ===
                      "Positive Behavior Shout Out!" && (
                      <div className="points-container">
                        <div className="point-field">
                          <div className="wallet-after">
                            <p>
                              {" "}
                              Wallet after shout out:{" "}
                              {difference ? difference : 0}
                            </p>
                          </div>
                          <TextField
                            type="numeric"
                            margin="normal"
                            inputProps={{ style: { fontSize: 15 }, min: 0 }} // font size of input text
                            className="points-input"
                            required
                            onChange={handleCurrencyChange}
                            id="currency"
                            placeholder="Enter Amount"
                            name="currency"
                            autoFocus
                            value={currency}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            marginTop: "1%",
                          }}
                          className="points-arrow"
                        >
                          <KeyboardDoubleArrowUpIcon
                            onClick={() => setCurrency((prev) => prev + 1)}
                            sx={{ fontSize: 40 }}
                          />
                          <KeyboardDoubleArrowDownIcon
                            onClick={() =>
                              setCurrency((prev) =>
                                prev > 0 ? prev - 1 : prev
                              )
                            }
                            sx={{ fontSize: 40 }}
                          />
                        </div>
                        <div className="shout-message">
                          <p>
                            Thank you for celebrating the positive behavior of a
                            student. Please include a description of the
                            students behavior below. Refrain from using any
                            other student’s name in this description unless they
                            were also involved in what caused this shout out.
                            Remember you can not give away more currency than
                            you have in your wallet and it does not replenish!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
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
                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevent form submission on Enter key

                        // Get the current cursor position
                        const { selectionStart, selectionEnd } = e.target;

                        // Get the current value of the input
                        const value = e.target.value;

                        // Insert a newline character (\n) at the cursor position
                        const newValue =
                          value.substring(0, selectionStart) +
                          "\n" +
                          value.substring(selectionEnd);

                        // Update the input value and set the cursor position after the newline character
                        e.target.value = newValue;
                        e.target.selectionStart = e.target.selectionEnd =
                          selectionStart + 1;

                        // Trigger the change event manually (React doesn't update the value automatically)
                        const event = new Event("input", { bubbles: true });
                        e.target.dispatchEvent(event);

                        // Optionally, you can add your logic here for what should happen after Enter is pressed.
                      }
                    }}
                  />
                </div>
                {isGuidance.isGuidanceBoolean && studentNames.length < 2 && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="guidanceDescription"
                    label="Brief Guidance Description"
                    name="guidanceDescription"
                    value={isGuidance.guidanceDescription}
                    onChange={handleGuidanceChange}
                  />
                )}
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
                          studentNames.length === 0
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
export default CreatePunishmentPanel;
