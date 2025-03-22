import React, { useState, useEffect, useRef } from "react";
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
  SnackbarCloseReason,
  SelectChangeEvent,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import { baseUrl } from "../utils/jsonData";
import "./modal.css";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MuiAlert>
>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface ContactUsProps {
  setContactUsDisplayModal: (modal: string) => void;
}

export const ContactUsModal: React.FC<ContactUsProps> = ({
  setContactUsDisplayModal,
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

  const modalRef = useRef<HTMLDivElement | null>(null);
  const autoCompleteRef = useRef<HTMLDivElement | null>(null); // Create a ref for the Autocomplete dropdown

  // Close modal if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current?.contains(event.target as Node) === false && // Optional chaining here
        autoCompleteRef.current?.contains(event.target as Node) === false // Optional chaining here
      ) {
        setContactUsDisplayModal("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setContactUsDisplayModal]);

  // Reset fields when modal closes
  useEffect(() => {
    if (!setContactUsDisplayModal) {
      setSelectedTopic("");
      setEmailAddress("");
      setMessage("");
      setWarningToast(false);
      setEmailValidationMessage("");
    }
  }, [setContactUsDisplayModal]);

  const handleTopicChange = (event: SelectChangeEvent<string>) => {
    setSelectedTopic(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAddress(event.target.value);
  };

  const handleMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
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
            setContactUsDisplayModal("");
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
            setContactUsDisplayModal("");
          }, 2000);
        })
        .catch((error) => console.error(error));
    }
  };

  const handleCloseSnackbar = (
    event: React.SyntheticEvent<any, Event> | Event, // For Snackbar
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setWarningToast(false);
  };

  // This wrapper function is for the Alert component to match the expected type
  const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
    setWarningToast(false);
  };

  const handleCloseModal = () => {
    setSelectedTopic("");
    setEmailAddress("");
    setMessage("");
    setWarningToast(false);
    setEmailValidationMessage("");
    setContactUsDisplayModal("");
  };

  return (
    <>
      <Snackbar
        open={warningToast}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleAlertClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          The Support Team has been Notified
        </Alert>
      </Snackbar>

      <div
        ref={modalRef}
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
              <MenuItem
                key={topic}
                value={topic}
                sx={{ fontSize: "1.5rem", textAlign: "center" }}
              >
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
          style={{
            marginBottom: "20px",
            fontSize: "1.5rem",
            textAlign: "center",
          }}
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
            fontSize: "1.5rem",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={!selectedTopic || !message}
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            sx={{ fontSize: "1.3rem"}}
          >
            Send Message
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleCloseModal}
            sx={{ fontSize: "1.3rem"}}
          >
            Close
          </Button>
        </div>
      </div>
    </>
  );
};
