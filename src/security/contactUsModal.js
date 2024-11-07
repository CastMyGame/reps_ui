import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import { baseUrl } from "../utils/jsonData";
import "./modal.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ContactUsModal = ({
  setContactUsDisplayModal,
  contactUsDisplayModal,
}) => {
  const topics = [
    "Guidance Request",
    "General Inquiry",
    "Login Issue",
    "Billing Issue",
    "Student Issue",
    "Tool Issue",
  ];

  const [selectedTopic, setSelectedTopic] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [message, setMessage] = useState("");
  const [warningToast, setWarningToast] = useState(false);
  const [emailValidationMessage, setEmailValidationMessage] = useState("");

  // Reset fields when modal closes
  useEffect(() => {
    if (!contactUsDisplayModal) {
      setSelectedTopic("");
      setEmailAddress("");
      setMessage("");
      setWarningToast(false);
      setEmailValidationMessage("");
    }
  }, [contactUsDisplayModal]);

  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmailAddress(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    setEmailValidationMessage("");

    // Regular expression for basic email validation
    const emailValidationRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the entered email is valid
    if (!emailValidationRegex.test(emailAddress)) {
      setEmailValidationMessage("Invalid email address");
      return; // Exit the function if the email is not valid
    }

    // Clear any previous validation message
    setEmailValidationMessage("");

    if (selectedTopic === "Guidance Request") {
      const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };
      const payload = {
        guidance: {
          studentEmail: emailAddress,
          teacherEmail: sessionStorage.getItem("email"),
          referralDescription: [message],
        },
      };

      axios
        .post(`${baseUrl}/punish/v1/guidance/new`, payload, {
          headers: headers,
        })
        .then((response) => {
          setWarningToast(true);
          setTimeout(() => {
            setWarningToast(false);
            setContactUsDisplayModal(false);
          }, 2000);
        })
        .catch((error) => console.error(error));
    } else {
      const payload = {
        email: emailAddress,
        subject: selectedTopic,
        message: message,
      };
      axios
        .post(`${baseUrl}/contact-us`, payload)
        .then((response) => {
          setWarningToast(true);
          setTimeout(() => {
            setWarningToast(false);
            setContactUsDisplayModal(false);
          }, 2000);
        })
        .catch((error) => console.error(error));
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setWarningToast(false);
  };

  return (
    <>
      <Snackbar
        open={warningToast}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          The Support Team has been Notified
        </Alert>
      </Snackbar>

      <div
        className="pop-modal"
        style={{
          zIndex: 2,
        }}
      >
        <div className="header" style={{ marginBottom: "20px" }}>
          <Typography variant="h5">Have a Question or Need Help?</Typography>
        </div>

        <FormControl
          fullWidth
          variant="outlined"
          style={{ marginBottom: "20px", zIndex: 9999 }}
        >
          <InputLabel id="topic-label">Choose Topic</InputLabel>
          <Select
            labelId="topic-label"
            id="topic-select"
            value={selectedTopic}
            onChange={handleTopicChange}
            label="Choose Topic"
          >
            {topics.map((topic) => (
              <MenuItem key={topic} value={topic}>
                {topic}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Email Address"
          variant="outlined"
          fullWidth
          margin="normal"
          value={emailAddress}
          onChange={handleEmailChange}
          error={Boolean(emailValidationMessage)}
          helperText={emailValidationMessage}
          style={{ marginBottom: "20px" }}
        />

        <TextareaAutosize
          minRows={4}
          placeholder="Enter your message..."
          value={message}
          onChange={handleMessageChange}
          style={{
            width: "100%",
            marginBottom: "20px",
            padding: "10px",
            borderRadius: "5px",
            resize: "vertical",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={!selectedTopic || !message}
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
          >
            Send Message
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => setContactUsDisplayModal(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </>
  );
};
