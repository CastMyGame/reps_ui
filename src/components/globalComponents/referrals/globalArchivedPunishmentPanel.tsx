import React, { useEffect, useState } from "react";

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
import { TeacherReferral } from "src/types/responses";
import { Student } from "src/types/school";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MuiAlert>
>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface GlobalArchivedProps {
  filter: string;
  roleType: string;
}

const GlobalArchivedPunishmentPanel: React.FC<GlobalArchivedProps> = ({
  filter,
  roleType,
}) => {
  const [listOfPunishments, setListOfPunishments] = useState([]);
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("");
  const [loadingPunishmentId, setLoadingPunishmentId] = useState<{
    id: string | null;
    buttonType: string;
  }>({
    id: null,
    buttonType: "",
  });
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
    buttonType: "",
  });
  const [deletePayload, setDeletePayload] = useState<TeacherReferral | null>(
    null
  );
  const [textareaValue, setTextareaValue] = useState("");
  const [render, setRender] = useState(false);

  const url = `${baseUrl}/punish/v1/archived`;

  useEffect(() => {
    setLoading(true);
    const url = `${baseUrl}/student/v1/allStudents`;
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
    };

    axios
      .get(url, { headers })
      .then((response) => {
        setListOfStudents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    setSort(filter);
  }, [filter]);

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        const sortedData = response.data.sort(
          (a: TeacherReferral, b: TeacherReferral) =>
            new Date(a.timeCreated).getTime() -
            new Date(b.timeCreated).getTime()
        );
        if (roleType === "teacher") {
          const sortedByRole = sortedData.filter(
            (x: TeacherReferral) =>
              x.teacherEmail === sessionStorage.getItem("email")
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
  }, [render, roleType, url]);

  const data = listOfPunishments;

  const hasScroll = data.length > 10;

  const calculateDaysSince = (dateCreated: Date) => {
    const currentDate = new Date();
    const createdDate = new Date(dateCreated);

    // Set both dates to UTC
    currentDate.setUTCHours(0, 0, 0, 0);
    createdDate.setUTCHours(0, 0, 0, 0);

    const timeDifference = currentDate.getTime() - createdDate.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return daysDifference;
  };

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTextareaValue(event.target.value);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setToast({ visible: false, message: "" });
  };

  const handleRestoreArchive = (obj: TeacherReferral) => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
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
        setOpenModal({
          display: false,
          message: "",
          buttonType: "",
        });
        setTimeout(() => {
          setToast({ visible: false, message: "" });
          setLoadingPunishmentId({ id: null, buttonType: "" });
        }, 1000);
      });
  };

  const handleDeletePunishment = (obj: TeacherReferral) => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
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
        setOpenModal({
          display: false,
          message: "",
          buttonType: "",
        });
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
                  setOpenModal({
                    display: false,
                    message: "",
                    buttonType: "",
                  });
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
                  onClick={() => handleDeletePunishment(deletePayload!)}
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
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
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
              <TableCell variant="head" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                Name
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                Referral Type
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                Deleted On
              </TableCell>{" "}
              <TableCell variant="head" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                Deleted By
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                Reason Deleted
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                Status
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                Days Since
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((x: TeacherReferral, key) => {
                const days = calculateDaysSince(x.timeCreated);
                const foundStudent = listOfStudents.find(
                  (student) => student.studentEmail === x.studentEmail
                );
                return (
                  <TableRow key={key}>
                    <TableCell style={{ fontSize: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <AccountCircleIcon
                          style={{
                            fontSize: "2rem", // Adjust the size as needed
                            color: "rgb(25, 118, 210)", // Change the color to blue
                          }}
                        />
                        <span>
                        {foundStudent?.firstName ?? "Unknown"} {foundStudent?.lastName ?? "Student"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell style={{ fontSize: "1.5rem" }}>{x.infractionName}</TableCell>
                    <TableCell style={{ width: "75px", fontSize: "1.5rem" }}>
                      {new Date(x.archivedOn).toLocaleDateString()}
                    </TableCell>
                    <TableCell style={{ fontSize: "1.5rem" }}>{x.archivedBy}</TableCell>
                    <TableCell style={{ fontSize: "1.5rem" }}>{x.archivedExplanation.slice(2, -2)}</TableCell>

                    <TableCell style={{ fontSize: "1.5rem" }}>
                      <div
                        className={`status-tag ${days >= 4 ? "tag-critical" : days >= 3 ? "tag-danger" : days >= 2 ? "tag-warning" : "tag-good"}`}
                      >
                        {x.status}
                      </div>
                    </TableCell>

                    <TableCell style={{ fontSize: "1.5rem" }}>{days}</TableCell>
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
                        {loadingPunishmentId.id === x.punishmentId &&
                        loadingPunishmentId.buttonType === "close" ? (
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
                        {loadingPunishmentId.id === x.punishmentId &&
                        loadingPunishmentId.buttonType === "delete" ? (
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
                <TableCell colSpan={5}>No open assignments found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default GlobalArchivedPunishmentPanel;
