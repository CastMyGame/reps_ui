import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../utils/jsonData";
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
  Typography,
} from "@mui/material";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import Checkbox from "@mui/material/Checkbox";
import { AdminOverviewDto, TeacherOverviewDto } from "src/types/responses";
import {
  PhoneLog,
  ReferralPayload,
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

interface CreatePunishmentProps {
  setPanelName: (panel: string) => void;
  data: TeacherOverviewDto | AdminOverviewDto;
}

const CreatePunishmentPanel: React.FC<CreatePunishmentProps> = ({
  setPanelName,
  data,
}) => {
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

  useEffect(() => {
    setTeacherEmailSelected(sessionStorage.getItem("email"));
  }, []);

  const [currency, setCurrency] = useState<number>(0);

  const [isGuidance, setIsGuidance] = useState({
    isGuidanceBoolean: false,
    guidanceDescription: "",
  });

  const [isPhoneLog, setIsPhoneLog] = useState<PhoneLog>({
    isPhoneLogBoolean: false,
    phoneLogDescription: "",
  });

  const defaultTheme = createTheme();

  const infractionPeriodSelectOptions = [
    { value: "exchange", label: "Class Exchange" },
    { value: "afterSchool", label: "After School" },
    { value: "lunch", label: "Lunch" },
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
    { value: "Inappropriate Language", label: "Inappropriate Language" },
    {
      value: "Positive Behavior Shout Out!",
      label: "Positive Behavior Shout Out!",
    },
    { value: "Behavioral Concern", label: "Behavioral Concern" },
    { value: "Academic Concern", label: "Academic Concern" },
    { value: "Failure to Complete Work", label: "Failure to Complete Work" },
  ] as const;

  const descriptions: Partial<Record<InfractionType, string>> = {
    "Failure to Complete Work":
      "Please provide a description of the overdue assignment, its original due date, and include a hyperlink to the assignment if accessible. Additionally, explain the impact the missing assignment is currently having on their overall grade and the points the student can earn by completing the work.",

    "Positive Behavior Shout Out!": "",
  };

  type InfractionType = (typeof infractionSelectOptions)[number]["value"];

  const getDescription = (selectedOption: InfractionType): string => {
    return (
      descriptions[selectedOption] ??
      "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts."
    );
  };

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
        (student) => student.studentEmail === email
      );
      return result[0].parentPhoneNumber || "";
    } else {
      return "";
    }
  };

  const resetForm = () => {
    setStudentNames([]);
    setInfractionPeriodSelected(null);
    setInfractionTypeSelected(null);
    setInfractionDescriptionSelected("");
    setIsGuidance({ isGuidanceBoolean: false, guidanceDescription: "" });
    setIsPhoneLog({ isPhoneLogBoolean: false, phoneLogDescription: "" });
  };

  //Mapping selected students pushing indivdual payloads to post
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    event.preventDefault();
    setLoading(true);
    setOpenModal({ display: false, message: "", buttonType: "" });
    const payloadContent: ReferralPayload[] = [];
    studentNames.forEach((student) => {
      const studentOption = listOfStudents.find(
        (s) => s.studentEmail === student.value
      );
      if (!studentOption) return;

      const personalizedDescription = replaceTokens(
        infractionDescriptionSelected,
        studentOption
      );
      const studentPayload: ReferralPayload = {
        studentEmail: student.value,
        teacherEmail: teacherEmailSelected ?? "",
        infractionPeriod: infractionPeriodSelected ?? "",
        infractionName: infractionTypeSelected ?? "",
        infractionDescription: personalizedDescription ?? "",
        currency: currency ?? 0,
        guidanceDescription: isGuidance.guidanceDescription ?? "",
        phoneLogDescription: isPhoneLog.phoneLogDescription ?? "",
      };
      payloadContent.push(studentPayload);
    });

    const payload = payloadContent;

    if (isGuidance.isGuidanceBoolean) {
      const guidancePayloadContent = studentNames.map((student) => ({
        guidance: {
          studentEmail: student.value,
          classPeriod: infractionPeriodSelected,
          teacherEmail: teacherEmailSelected,
          referralDescription: [isGuidance.guidanceDescription],
        },
      }));

      axios
        .post(
          `${baseUrl}/punish/v1/guidance/formList`,
          guidancePayloadContent,
          {
            headers: headers,
          }
        )
        .then(function (res) {
          window.alert(`Counseling Referral has been created`);
        })
        .catch(function (error) {
          console.error(error);
        });
    }

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

  const difference =
    (data?.teacher?.currency ?? 0) - currency * (studentNames.length || 0);

  const handleGuidanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setIsGuidance((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePhoneLogChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setIsPhoneLog((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleGuidanceCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { checked } = event.target;
    setIsGuidance((prevState) => ({
      ...prevState,
      isGuidanceBoolean: checked,
    }));
  };

  const handlePhoneLogCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { checked } = event.target;
    setIsPhoneLog((prevState) => ({
      ...prevState,
      isPhoneLogBoolean: checked,
    }));
  };

  const insertAtCursor = (token: string) => {
    const { selectionStart, selectionEnd, value } = document.getElementById(
      "offenseDescription"
    ) as HTMLTextAreaElement;

    // Insert the token at the cursor position
    const newValue =
      value.substring(0, selectionStart) +
      token +
      value.substring(selectionEnd);

    // Update the text area value in React state
    setInfractionDescriptionSelected(newValue);

    // Adjust the cursor position to be after the inserted token
    setTimeout(() => {
      const textArea = document.getElementById(
        "offenseDescription"
      ) as HTMLTextAreaElement;
      textArea.selectionStart = textArea.selectionEnd =
        selectionStart + token.length;
    }, 0);
  };

  const handleTextAreaClick = (e: React.MouseEvent) => {
    // This can be used to manage cursor behavior if necessary
    const textArea = e.target as HTMLTextAreaElement;
    const cursorPos = textArea.selectionStart;

    // Save the cursor position so it doesn't reset
    setTimeout(() => {
      textArea.selectionStart = textArea.selectionEnd = cursorPos;
    }, 0);
  };

  const replaceTokens = (template: string, student: Student): string => {
    return template
      .replace(/\$firstName/g, student.firstName)
      .replace(/\$lastName/g, student.lastName)
      .replace(/\$grade/g, student.grade)
      .replace(/\$parentEmail/g, student.parentEmail)
      .replace(/\$studentEmail/g, student.studentEmail);
    // Add more .replace() lines if you want to support more tokens
  };

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
                sx={{ mt: 1, width: "100%" }}
              >
                <h4>Submitting Teacher: {teacherEmailSelected}</h4>
                <hr />

                <Autocomplete
                  multiple
                  className="student-dropdown"
                  id="demo-multiple-chip"
                  value={studentNames}
                  onChange={(event, newValue) => {
                    if (!Array.isArray(newValue)) {
                      console.error("newValue is not an array:", newValue);
                      setStudentNames([]);
                      return;
                    }

                    setStudentNames(newValue); // Ensure newValue is an array of selected students
                  }}
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
                {studentNames.length > 0 &&
                  infractionTypeSelected != null &&
                  infractionPeriodSelected != null && (
                    <div>
                      <div className="question-container-text-area">
                        <p style={{ fontSize: 24 }}>
                          {infractionTypeSelected ===
                            "Failure to Complete Work" ||
                          infractionTypeSelected ===
                            "Positive Behavior Shout Out!" ||
                          infractionTypeSelected === "Behavioral Concern"
                            ? getDescription(infractionTypeSelected)
                            : "Description of Behavior/Event. This will be sent directly to the student and guardian so be sure to provide accurate and objective facts as well as do NOT include the names of any other students."}
                        </p>
                        <div>
                          {studentNames.length === 1 &&
                            infractionTypeSelected !==
                              "Positive Behavior Shout Out!" && (
                              <div className="guidance-box">
                                <FormGroup>
                                  <FormControlLabel
                                    style={{ color: "black" }}
                                    componentsProps={{
                                      typography: { variant: "h4" },
                                    }}
                                    value="end"
                                    labelPlacement="end"
                                    control={
                                      <Checkbox
                                        color="primary"
                                        checked={isGuidance.isGuidanceBoolean}
                                        sx={{
                                          "& .MuiSvgIcon-root": {
                                            fontSize: 28,
                                          },
                                        }}
                                        onChange={handleGuidanceCheckboxChange}
                                        name="isGuidanceBoolean"
                                      />
                                    }
                                    label="Create Counseling Referral"
                                  />
                                  {isGuidance.isGuidanceBoolean &&
                                    studentNames.length < 2 && (
                                      <h4>Description goes here</h4>
                                    )}
                                </FormGroup>
                              </div>
                            )}
                          {studentNames.length === 1 && (
                            <div className="guidance-box">
                              <FormGroup>
                                <FormControlLabel
                                  style={{ color: "black" }}
                                  componentsProps={{
                                    typography: { variant: "h4" },
                                  }}
                                  value="end"
                                  labelPlacement="end"
                                  control={
                                    <Checkbox
                                      color="primary"
                                      checked={isPhoneLog.isPhoneLogBoolean}
                                      sx={{
                                        "& .MuiSvgIcon-root": { fontSize: 28 },
                                      }}
                                      onChange={handlePhoneLogCheckboxChange}
                                      name="isPhoneLogBoolean"
                                    />
                                  }
                                  label="Log Phone Call"
                                />

                                {isPhoneLog.isPhoneLogBoolean && (
                                  <h4>Phone Log goes here</h4>
                                )}
                              </FormGroup>
                            </div>
                          )}
                          {infractionTypeSelected ===
                            "Positive Behavior Shout Out!" && (
                            <div className="points-container">
                              <div className="point-field">
                                <div className="wallet-after">
                                  <p>
                                    {" "}
                                    Wallet after shout out: {difference ?? 0}
                                  </p>
                                </div>
                                <TextField
                                  type="numeric"
                                  margin="normal"
                                  inputProps={{
                                    style: { fontSize: 15 },
                                    min: 0,
                                  }} // font size of input text
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
                                  onClick={() =>
                                    setCurrency((prev) => prev + 1)
                                  }
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
                                  Thank you for celebrating the positive
                                  behavior of a student. Please include a
                                  description of the students behavior below.
                                  Refrain from using any student’s name in this
                                  description. Remember you can not give away
                                  more currency than you have in your wallet and
                                  it does not replenish!
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontSize: "1.2rem" }}
                          >
                            Insert Student Info:
                          </Typography>
                          {[
                            { field: "firstName", label: "$firstName" },
                            { field: "lastName", label: "$lastName" },
                            { field: "grade", label: "$grade" },
                            { field: "parentEmail", label: "$parentEmail" },
                          ].map(({ field, label }) => (
                            <Button
                              key={field}
                              size="large"
                              variant="outlined"
                              sx={{
                                mr: 1,
                                mb: 1,
                                fontSize: "1.2rem", // Increase font size inside buttons
                                padding: "12px 24px",
                              }} // Adjust button padding for a larger button }}
                              onClick={() => insertAtCursor(label)}
                            >
                              {field}
                            </Button>
                          ))}
                        </Box>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          multiline
                          minRows={4} // Optional: Set minimum number of rows
                          maxRows={4}
                          onChange={(event) => {
                            const enteredValue = event.target.value;
                            setInfractionDescriptionSelected(enteredValue);
                          }}
                          id="offenseDescription"
                          label="Brief Infraction Description"
                          name="offenseDescription"
                          autoFocus
                          value={infractionDescriptionSelected}
                          inputProps={{ style: { resize: "none" }, min: 0 }} // font size of input text
                          InputLabelProps={{
                            sx: {
                              "&.Mui-focused": {
                                color: "white",
                                marginTop: "-10px",
                              },
                            },
                          }}
                          sx={{
                            fontSize: 40,
                            height: "auto", // Keeps height dynamic but within limits
                            maxHeight: "150px", // Approximate height of 4 rows
                            overflowY: "auto", // Adds scrollbar if text overflows
                          }}
                          onClick={handleTextAreaClick}
                          onKeyDown={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const { selectionStart, selectionEnd } = target;
                              const value = target.value;
                              const newValue =
                                value.substring(0, selectionStart) +
                                "\n" +
                                value.substring(selectionEnd);
                              setInfractionDescriptionSelected(newValue);
                            }
                          }}
                        />
                      </div>
                      {isGuidance.isGuidanceBoolean && (
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          minRows={3}
                          maxRows={3}
                          id="guidanceDescription"
                          label="Brief Counseling Description"
                          name="guidanceDescription"
                          value={isGuidance.guidanceDescription}
                          onChange={handleGuidanceChange}
                          inputProps={{ style: { resize: "none" }, min: 0 }} // font size of input text
                          InputLabelProps={{
                            sx: {
                              "&.Mui-focused": {
                                color: "white",
                                marginTop: "-10px",
                              },
                            },
                          }}
                          sx={{
                            fontSize: 40,
                            height: "auto", // Keeps height dynamic but within limits
                            maxHeight: "150px", // Approximate height of 4 rows
                            overflowY: "auto", // Adds scrollbar if text overflows
                          }}
                        />
                      )}
                      {isPhoneLog.isPhoneLogBoolean &&
                        studentNames.length < 2 && (
                          <>
                            <Box
                              component="section"
                              sx={{
                                p: 2,
                                border: "1px dashed grey",
                                fontSize: 40,
                              }}
                            >
                              Parent phone number:{" "}
                              {getPhoneNumber(studentNames[0].value)}
                            </Box>
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              minRows={3}
                              maxRows={3}
                              id="phoneLogDescription"
                              label="Phone Log Description"
                              name="phoneLogDescription"
                              value={isPhoneLog.phoneLogDescription}
                              onChange={handlePhoneLogChange}
                              inputProps={{ style: { resize: "none" }, min: 0 }} // font size of input text
                              InputLabelProps={{
                                sx: {
                                  "&.Mui-focused": {
                                    color: "white",
                                    marginTop: "-10px",
                                  },
                                },
                              }}
                              sx={{
                                fontSize: 40,
                                height: "auto", // Keeps height dynamic but within limits
                                maxHeight: "150px", // Approximate height of 4 rows
                                overflowY: "auto", // Adds scrollbar if text overflows
                              }}
                            />
                          </>
                        )}
                      {/* <br/> */}
                    </div>
                  )}
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
export default CreatePunishmentPanel;
