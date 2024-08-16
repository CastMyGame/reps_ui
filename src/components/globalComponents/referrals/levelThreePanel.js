import { useEffect, useState } from "react";
import * as React from "react";

import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  createTheme,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import { baseUrl } from "../../../utils/jsonData";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingWheelPanel from "../../../roles/student/blankPanelForTest";

const LevelThreePanel = ({ roleType }) => {
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [listOfPunishments, setListOfPunishments] = useState([]);
  const [sort, setSort] = useState("");
  const [loadingPunishmentId, setLoadingPunishmentId] = useState({
    id: null,
    buttonType: "",
  });
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
    buttonType: "",
    data: null,
  });
  const [deletePayload, setDeletePayload] = useState(null);
  const [textareaValue, setTextareaValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("Open");

  const defaultTheme = createTheme();

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const url = `${baseUrl}/DTO/v1/punishmentsDTO`;

  useEffect(() => {
    setSort(filter);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        const sortedData = response.data.sort(
          (a, b) =>
            new Date(a.punishment.timeCreated) -
            new Date(b.punishment.timeCreated)
        );
        if (roleType === "teacher") {
          setLoading(false);

          const sortedByRole = sortedData.filter(
            (x) => x.punishment.teacherEmail === sessionStorage.getItem("email")
          );
          setListOfPunishments(sortedByRole);
        } else {
          const sortedByRole = sortedData;
          setLoading(false);

          setListOfPunishments(sortedByRole);
        }
      })
      .catch(function (error) {
        setLoading(false);

        console.error(error);
      });
  }, [toast.visible]);

  let data =
    sort === "ALL"
      ? listOfPunishments
      : sort === "Open"
        ? listOfPunishments.filter(
            (x) =>
              x.punishment.status === "PENDING" ||
              (x.punishment.infractionName === "Failure to Complete Work" &&
                x.punishment.status === "PENDING")
          )
        : listOfPunishments.filter((x) => x.punishment.status === sort);

  const hasScroll = data.length > 10;

  const calculateDaysSince = (dateCreated) => {
    const currentDate = new Date();
    const createdDate = new Date(dateCreated);

    // Set both dates to UTC
    currentDate.setUTCHours(0, 0, 0, 0);
    createdDate.setUTCHours(0, 0, 0, 0);

    const timeDifference = currentDate - createdDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return daysDifference;
  };

  const handleTextareaChange = (event) => {
    setTextareaValue(event.target.value);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setToast({ visible: false, message: "" });
  };

  const handleClosePunishment = (obj) => {
    setLoadingPunishmentId({
      id: obj.punishment.punishmentId,
      buttonType: "close",
    });
    const url = `${baseUrl}/punish/v1/close/${obj.punishment.punishmentId}`;
    axios
      .post(url, [textareaValue], { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({ visible: true, message: "Your Referral was closed" });
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        setOpenModal({ display: false, message: "" });
        setTimeout(() => {
          setToast({ visible: false, message: "" });
          setLoadingPunishmentId({ id: null, buttonType: "" });
        }, 1000);
      });
  };

  const handleRejectPunishment = (obj) => {
    setLoadingPunishmentId({
      id: obj.punishment.punishmentId,
      buttonType: "close",
    });
    const url = `${baseUrl}/punish/v1/rejected/${obj.punishment.punishmentId}`;
    axios
      .put(url, [textareaValue], { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({
          visible: true,
          message:
            "You have rejected the student's answers and an email has been sent letting them know.",
        });
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        setOpenModal({ display: false, message: "" });
        setTimeout(() => {
          setToast({ visible: false, message: "" });
          setLoadingPunishmentId({ id: null, buttonType: "" });
        }, 1000);
      });
  };

  return (
    <>
      {openModal.display && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{openModal.message}</h3>
              <div className="answer-container">
                {openModal.data.punishment.infractionDescription.map(
                  (item, index) => {
                    if (index > 1) {
                      const match = item.match(
                        /question=([\s\S]+?),\s*answer=([\s\S]+?)(?=\))/
                      );
                      if (match) {
                        const question = match[1].trim();
                        const answer = match[2].trim();

                        return (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              border: "1px solid black",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "grey",
                                minHeight: "15px",
                                width: "40%",
                              }}
                            >
                              <strong>Question:</strong> {question}
                            </div>
                            <div
                              style={{
                                color: "black",
                                backgroundColor: "lightBlue",
                                minHeight: "50px",
                                width: "60%",
                                textAlign: "left",
                                paddingLeft: "10px",
                              }}
                            >
                              <strong>Answer:</strong> {answer}
                            </div>
                          </div>
                        );
                      }
                    }
                  }
                )}
              </div>
            </div>
            <div className="modal-body">
              <textarea
                value={textareaValue} // Set the value of the textarea to the state variable
                onChange={handleTextareaChange} // Handle changes to the textarea
                className="multi-line-input"
                placeholder="Enter additional comments"
                rows={4} // This sets the initial height to show 4 rows
              ></textarea>
            </div>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setOpenModal({ display: false, message: "" });
                  setTextareaValue("");
                }}
              >
                Cancel
              </button>
              <button
                disabled={textareaValue.length === 0}
                style={{
                  backgroundColor: textareaValue === "" ? "grey" : "red",
                }}
                onClick={() => handleRejectPunishment(deletePayload)}
              >
                Reject Answers
              </button>
              <button
                disabled={textareaValue.length === 0}
                style={{
                  backgroundColor: textareaValue === "" ? "grey" : "green",
                }}
                onClick={() => {
                  handleClosePunishment(deletePayload);
                  console.log(deletePayload);
                }}
              >
                Accept Answers
              </button>
            </div>
          </div>
        </div>
      )}

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={toast.visible}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert Close={handleClose} severity="success" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
      <TableContainer
        component={Paper}
        style={{
          maxHeight: hasScroll ? "75vh" : "auto",
          overflowY: hasScroll ? "scroll" : "visible",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Name
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Referral Type
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Description
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Level
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Status
              </TableCell>

              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: 24 }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <div style={{ position: "absolute", marginLeft: "50%" }}>
              <LoadingWheelPanel />
            </div>
          ) : (
            <TableBody>
              {data.length > 0 ? (
                data.map((x, key) => {
                  const days = calculateDaysSince(x.punishment.timeCreated);

                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <AccountCircleIcon
                            style={{
                              alignItems: "center",
                              fontSize: "2rem", // Adjust the size as needed
                              color: "rgb(25, 118, 210)", // Change the color to blue
                            }}
                          />
                          <span
                            style={{
                              fontSize: 18,
                            }}
                          >
                            {x.firstName} {x.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        style={{
                          fontSize: 18,
                        }}
                      >
                        {x.punishment.infractionName}
                      </TableCell>
                      <TableCell
                        style={{
                          fontSize: 18,
                          maxWidth: "60%",
                        }}
                      >
                        {x.punishment.infractionDescription[0]}
                      </TableCell>
                      <TableCell
                        style={{
                          fontSize: 18,
                        }}
                      >
                        {x.punishment.infractionLevel}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`status-tag ${days >= 4 ? "tag-critical" : days >= 3 ? "tag-danger" : days >= 2 ? "tag-warning" : "tag-good"}`}
                        >
                          {x.punishment.status}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="level-three-button-container">
                          {x.punishment.infractionLevel === "3" ? (
                            <>
                              <button
                                className="level-three-buttons"
                                onClick={() => {
                                  setOpenModal({
                                    display: true,
                                    message:
                                      "Please Review Student Answers, Accept and Reject buttons are enabled when text is entered in comment section either approving or explaining the rejection",
                                    buttonType: "close",
                                    data: x,
                                  });
                                  setDeletePayload(x);
                                }}
                              >
                                {loadingPunishmentId.id ===
                                  x.punishment.punishmentId &&
                                loadingPunishmentId.buttonType === "close" ? (
                                  <CircularProgress
                                    style={{ height: "20px", width: "20px" }}
                                    color="secondary"
                                  />
                                ) : (
                                  <div>Review</div>
                                )}
                              </button>
                            </>
                          ) : (
                            <button
                              style={{ height: "45px", width: "150px" }}
                              onClick={() => {
                                handleClosePunishment(x);
                              }}
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan="5"
                    style={{
                      fontSize: 18,
                      fontWeight: "lighter",
                      fontStyle: "italic",
                    }}
                  >
                    No Open ended questions need reviewing
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </>
  );
};

export default LevelThreePanel;
