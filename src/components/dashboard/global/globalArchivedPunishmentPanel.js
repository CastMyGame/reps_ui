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
} from "@mui/material";
import Typography from "@mui/material/Typography";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import { baseUrl } from "../../../utils/jsonData";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RestoreIcon from "@mui/icons-material/Restore";

const GlobalArchivedPunishmentPanel = ({ filter, roleType }) => {
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [listOfPunishments, setListOfPunishments] = useState([]);
  const [sort, setSort] = useState("");
  const [loadingPunihsmentId, setLoadingPunishmentId] = useState({
    id: null,
    buttonType: "",
  });
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
    buttonType: "",
  });
  const [deletePayload, setDeletePayload] = useState(null);
  const [textareaValue, setTextareaValue] = useState("");
  const [render, setRender] = useState(false);

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const url = `${baseUrl}/punish/v1/archived`;

  useEffect(() => {
    setSort(filter);
  }, [filter]);

  useEffect(() => {
    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        const sortedData = response.data.sort(
          (a, b) => new Date(a.timeCreated) - new Date(b.timeCreated)
        );
        if (roleType === "teacher") {
          const sortedByRole = sortedData.filter(
            (x) => x.teacherEmail === sessionStorage.getItem("email")
          );
          setListOfPunishments(sortedByRole);
        } else {
          const sortedByRole = sortedData;
          setListOfPunishments(sortedByRole);
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [render]);

  const data = listOfPunishments;

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

  const handleRestoreArchive = (obj) => {
    setLoadingPunishmentId({ id: obj.punishmentId, buttonType: "close" });

    const url = `${baseUrl}/punish/v1/archived/restore/${obj.punishmentId}`;
    axios
      .put(url, obj, { headers: headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({ visible: true, message: "Your Referral was Restored" });
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        setRender((prev) => !prev);
        setOpenModal({ display: false, message: "" });
        setTimeout(() => {
          setToast({ visible: false, message: "" });
          setLoadingPunishmentId({ id: null, buttonType: "" });
        }, 1000);
      });
  };

  const handleDeletePunishment = (obj) => {
    setLoadingPunishmentId({ id: obj.punishmentId, buttonType: "delete" });

    const url = `${baseUrl}/punish/v1/delete`;
    axios
      .delete(url, { headers: headers, data: obj }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({ visible: true, message: "Your Referral was Deleted" });
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        setRender((prev) => !prev);
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
            </div>
            <div className="modal-body">
              <textarea
                value={textareaValue} // Set the value of the textarea to the state variable
                onChange={handleTextareaChange} // Handle changes to the textarea
                className="multi-line-input"
                placeholder="Enter reason for deletion"
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
              {openModal.buttonType === "delete" && (
                <button
                  disabled={textareaValue.length === 0}
                  style={{
                    backgroundColor: textareaValue === "" ? "grey" : "red",
                  }}
                  onClick={() => handleDeletePunishment(deletePayload)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Typography
        color="white"
        variant="h6"
        style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
      ></Typography>
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
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Name
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Referral Type
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Deleted On
              </TableCell>{" "}
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Deleted By
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Reason Deleted
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Days Since
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((x, key) => {
                const days = calculateDaysSince(x.timeCreated);

                return (
                  <TableRow key={key}>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <AccountCircleIcon
                          style={{
                            fontSize: "2rem", // Adjust the size as needed
                            color: "rgb(25, 118, 210)", // Change the color to blue
                          }}
                        />
                        <span>
                          {x.student.firstName} {x.student.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{x.infraction.infractionName}</TableCell>
                    <TableCell style={{ width: "75px" }}>
                      {x.archivedOn}
                    </TableCell>
                    <TableCell>{x.archivedBy}</TableCell>
                    <TableCell>{x.archivedExplanation}</TableCell>

                    <TableCell>
                      <div
                        className={`status-tag ${days >= 4 ? "tag-critical" : days >= 3 ? "tag-danger" : days >= 2 ? "tag-warning" : "tag-good"}`}
                      >
                        {x.status}
                      </div>
                    </TableCell>

                    <TableCell>{days}</TableCell>
                    <TableCell>
                      <button
                        style={{
                          height: "80px",
                          width: "180px",
                          marginBottom: "5px",
                        }}
                        onClick={() => handleRestoreArchive(x)}
                      >
                        <p style={{ marginBottom: "5px", marginTop: "-2%" }}>
                          Restore Assignment
                        </p>
                        {loadingPunihsmentId.id === x.punishmentId &&
                        loadingPunihsmentId.buttonType === "close" ? (
                          <CircularProgress
                            style={{ height: "20px", width: "20px" }}
                            color="secondary"
                          />
                        ) : (
                          <RestoreIcon />
                        )}
                      </button>

                      <button
                        style={{
                          height: "80px",
                          width: "180px",
                          backgroundColor: "red",
                        }}
                        onClick={() => {
                          setOpenModal({
                            display: true,
                            message:
                              "Please provide brief explaination of why you will delete the record",
                            buttonType: "delete",
                          });
                          setDeletePayload(x);
                        }}
                      >
                        <p style={{ marginBottom: "5px", marginTop: "-2%" }}>
                          Permanently Delete
                        </p>
                        {loadingPunihsmentId.id === x.punishmentId &&
                        loadingPunihsmentId.buttonType === "delete" ? (
                          <CircularProgress
                            style={{ height: "20px", width: "20px" }}
                            color="secondary"
                          />
                        ) : (
                          <DeleteForeverIcon />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan="5">No open assignments found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default GlobalArchivedPunishmentPanel;
