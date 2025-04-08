import React, { useEffect, useState } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Select,
  Box,
  Chip,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import { baseUrl } from "../../../utils/jsonData";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { dateCreateFormat } from "../../../helperFunctions/helperFunctions";
import LoadingWheelPanel from "../../roles/student/LoadingWheelPanel";
import { PunishmentDto, TeacherReferral } from "src/types/responses";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MuiAlert>
>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface GlobalPunishmentProps {
  roleType: string;
}

const GlobalPunishmentPanel: React.FC<GlobalPunishmentProps> = ({
  roleType,
}) => {
  const [listOfPunishments, setListOfPunishments] = useState<PunishmentDto[]>(
    []
  );
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
  const [deletePayload, setDeletePayload] = useState<PunishmentDto | null>(
    null
  );
  const [textareaValue, setTextareaValue] = useState("");
  const [archivedData, setArchivedData] = useState([]);
  const [filter, setFilter] = useState("OPEN");
  const [loading, setLoading] = useState(false);

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const url = `${baseUrl}/DTO/v1/punishmentsDTO`;
  const urlArchive = `${baseUrl}/punish/v1/archived`;

  useEffect(() => {
    setSort(filter);
  }, [filter]);

  useEffect(() => {
    fetchPunishments();
  }, []);

  const fetchPunishments = async () => {
    setLoading(true);

    try {
      const [punishmentRes, archivedRes] = await Promise.all([
        axios.get(url, { headers }),
        axios.get(urlArchive, { headers }),
      ]);

      const sortedPunishments = punishmentRes.data.sort(
        (a: PunishmentDto, b: PunishmentDto) =>
          new Date(b.punishment.timeCreated).getTime() -
          new Date(a.punishment.timeCreated).getTime()
      );

      const sortedArchived = archivedRes.data.sort(
        (a: TeacherReferral, b: TeacherReferral) =>
          new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
      );

      if (roleType === "teacher") {
        const email = sessionStorage.getItem("email");

        setListOfPunishments(
          sortedPunishments.filter(
            (x: PunishmentDto) => x.punishment.teacherEmail === email
          )
        );

        setArchivedData(
          sortedArchived.filter(
            (x: TeacherReferral) => x.teacherEmail === email
          )
        );
      } else {
        setListOfPunishments(sortedPunishments);
        setArchivedData(sortedArchived);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //Merging the punishment and arhcived data

  let data: typeof listOfPunishments | typeof archivedData = [];

  if (sort === "ARCHIVED") {
    data = archivedData;
  } else if (sort === "ALL") {
    data = listOfPunishments;
  } else {
    data = listOfPunishments.filter((x) => x.punishment.status === sort);
  }

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

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
  };

  const filterOptions = [
    { value: "ALL", label: "All" },
    { value: "OPEN", label: "Open" },
    { value: "CLOSED", label: "Closed" },
    { value: "PENDING", label: "Pending" },
    { value: "FTC", label: "Failure to Complete Work" },
    { value: "REFERRAL", label: "Referral" },
  ];

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setToast({ visible: false, message: "" });
  };

  const handleClosePunishment = (obj: PunishmentDto) => {
    setLoadingPunishmentId({
      id: obj.punishment.punishmentId,
      buttonType: "close",
    });
    const url = `${baseUrl}/punish/v1/close/${obj.punishment.punishmentId}`;
    axios
      .post(url, [textareaValue], { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({ visible: true, message: "Your Referral was closed" });
        fetchPunishments();
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        setOpenModal({ display: false, message: "", buttonType: "" });
        setTimeout(() => {
          setToast({ visible: false, message: "" });
          setLoadingPunishmentId({ id: null, buttonType: "" });
        }, 1000);
      });
  };

  //Delete has been changed to archived api
  const handleDeletePunishment = (obj: PunishmentDto) => {
    setLoadingPunishmentId({
      id: obj.punishment.punishmentId,
      buttonType: "delete",
    });

    const url = `${baseUrl}/punish/v1/archived/${sessionStorage.getItem("email")}/${obj.punishment.punishmentId}`;
    axios
      .put(url, [textareaValue], { headers: headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({ visible: true, message: "Your Referral was Deleted" });
        fetchPunishments();
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        setOpenModal({ display: false, message: "", buttonType: "" });
        setTextareaValue("");
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
              <h3 style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                {openModal.message}
              </h3>
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
                style={{ backgroundColor: "red" }}
                onClick={() => {
                  setOpenModal({ display: false, message: "", buttonType: "" });
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
                  onClick={() =>
                    deletePayload && handleDeletePunishment(deletePayload)
                  }
                >
                  Delete Referral
                </button>
              )}
              {openModal.buttonType === "close" && (
                <button
                  disabled={textareaValue.length === 0}
                  style={{
                    backgroundColor: textareaValue === "" ? "grey" : "green",
                  }}
                  onClick={() =>
                    deletePayload && handleClosePunishment(deletePayload)
                  }
                >
                  Close Referral
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Select
        sx={{ width: "100%", backgroundColor: "white", fontSize: 24 }}
        labelId="filterSelected"
        value={filter}
        onChange={handleFilterChange}
        renderValue={(selected) => {
          // Check if selected is an array, if not, wrap it in an array
          const selectedArray = Array.isArray(selected) ? selected : [selected];

          return (
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, fontSize: 24 }}
            >
              {selectedArray.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  style={{ fontSize: 18, fontWeight: "bold" }}
                  variant="outlined"
                />
              ))}
            </Box>
          );
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        {filterOptions.map((name) => (
          <MenuItem
            key={name.value}
            value={name.value}
            style={{ fontSize: 18 }}
          >
            {name.label}
          </MenuItem>
        ))}
      </Select>

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
        {loading ? (
          <div style={{ position: "absolute", marginLeft: "50%" }}>
            <LoadingWheelPanel />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  variant="head"
                  style={{ fontWeight: "bold", fontSize: 18 }}
                >
                  Name
                </TableCell>
                <TableCell
                  variant="head"
                  style={{ fontWeight: "bold", fontSize: 18, maxWidth: "15%" }}
                >
                  Referral Type
                </TableCell>
                <TableCell
                  variant="head"
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    maxWidth: "40%",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  Description
                </TableCell>
                {roleType === "admin" ? (
                  <TableCell
                    variant="head"
                    style={{ fontWeight: "bold", fontSize: 18 }}
                  >
                    Created By
                  </TableCell>
                ) : (
                  <TableCell
                    variant="head"
                    style={{ fontWeight: "bold", fontSize: 18 }}
                  >
                    Level
                  </TableCell>
                )}

                <TableCell
                  variant="head"
                  style={{ fontWeight: "bold", fontSize: 18 }}
                >
                  Status
                </TableCell>
                <TableCell
                  variant="head"
                  style={{ fontWeight: "bold", fontSize: 18 }}
                >
                  Date Created
                </TableCell>
                <TableCell
                  variant="head"
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    maxWidth: "40%",
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((x, key) => {
                  const days = calculateDaysSince(x.punishment.timeCreated);

                  let statusClass = "tag-good";

                  if (days >= 4) {
                    statusClass = "tag-critical";
                  } else if (days >= 3) {
                    statusClass = "tag-danger";
                  } else if (days >= 2) {
                    statusClass = "tag-warning";
                  }

                  return (
                    <TableRow key={key.valueOf()}>
                      <TableCell>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <AccountCircleIcon
                            style={{
                              fontSize: "2rem", // Adjust the size as needed
                              color: "rgb(25, 118, 210)", // Change the color to blue
                            }}
                          />
                          <span
                            style={{
                              fontSize: 14,
                            }}
                          >
                            {x.studentFirstName} {x.studentLastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        style={{
                          fontSize: 14,
                        }}
                      >
                        {x.punishment.infractionName}
                      </TableCell>
                      <TableCell
                        style={{
                          maxWidth: "150px",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          fontSize: 14,
                        }}
                      >
                        {x.punishment.infractionDescription[0]}
                      </TableCell>
                      {roleType === "admin" ? (
                        <TableCell
                          style={{
                            fontSize: 14,
                            textAlign: "left",
                          }}
                        >
                          {x.punishment.teacherEmail}
                        </TableCell>
                      ) : (
                        <TableCell
                          style={{
                            fontSize: 14,
                            textAlign: "left",
                          }}
                        >
                          {x.punishment.infractionLevel}
                        </TableCell>
                      )}

                      <TableCell
                        style={{
                          fontSize: 14,
                        }}
                      >
                        <div className={`status-tag ${statusClass}`}>
                          {x.punishment.status}
                        </div>
                      </TableCell>

                      <TableCell
                        style={{
                          fontSize: 14,
                        }}
                      >
                        {dateCreateFormat(x.punishment.timeCreated)}
                      </TableCell>
                      <TableCell
                        style={{
                          alignItems: "center",
                        }}
                      >
                        {x.punishment.archived === false &&
                          (x.punishment.status === "OPEN" ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                style={{
                                  height: "60px",
                                  width: "180px",
                                  backgroundColor: "green",
                                }}
                                onClick={() => {
                                  setOpenModal({
                                    display: true,
                                    message:
                                      "You are attempting to remove the restorative assignment and close out a referral. If this was not your intent click cancel. If this is your intent, provide a brief explanation for why the restorative assignment is being removed and click Close",
                                    buttonType: "close",
                                  });
                                  setDeletePayload(x);
                                }}
                              >
                                <p
                                  style={{
                                    marginBottom: "5px",
                                    marginTop: "-2%",
                                  }}
                                >
                                  Close Referral
                                </p>
                                {loadingPunishmentId.id ===
                                  x.punishment.punishmentId &&
                                loadingPunishmentId.buttonType === "close" ? (
                                  <CircularProgress
                                    style={{ height: "20px", width: "20px" }}
                                    color="secondary"
                                  />
                                ) : (
                                  <CheckBoxIcon />
                                )}
                              </button>

                              <button
                                style={{
                                  height: "60px",
                                  width: "180px",
                                  backgroundColor: "red",
                                }}
                                onClick={() => {
                                  setOpenModal({
                                    display: true,
                                    message:
                                      "You are attempting to delete the record of this referral. If you were attempting to remove the restorative assignment and close out the referral please click cancel and hit the “Close Referral” button. If you still want to delete the record of this referral, provide a brief explanation for this action and click Delete Referral.",
                                    buttonType: "delete",
                                  });
                                  setDeletePayload(x);
                                }}
                              >
                                <p
                                  style={{
                                    marginBottom: "5px",
                                    marginTop: "-2%",
                                  }}
                                >
                                  Delete Referral
                                </p>
                                {loadingPunishmentId.id ===
                                  x.punishment.punishmentId &&
                                loadingPunishmentId.buttonType === "delete" ? (
                                  <CircularProgress
                                    style={{ height: "20px", width: "20px" }}
                                    color="secondary"
                                  />
                                ) : (
                                  <DeleteForeverIcon />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "10px" }}>
                              {" "}
                              <button
                                style={{
                                  height: "60px",
                                  width: "180px",
                                  backgroundColor: "red",
                                }}
                                onClick={() => {
                                  setOpenModal({
                                    display: true,
                                    message:
                                      "You are attempting to delete the record of this referral. If you were attempting to remove the restorative assignment and close out the referral please click cancel and hit the “Close Referral” button. If you still want to delete the record of this referral, provide a brief explanation for this action and click Delete Referral.",
                                    buttonType: "delete",
                                  });
                                  setDeletePayload(x);
                                }}
                              >
                                <p
                                  style={{
                                    marginBottom: "5px",
                                    marginTop: "-2%",
                                  }}
                                >
                                  Delete Referral
                                </p>
                                {loadingPunishmentId.id ===
                                  x.punishment.punishmentId &&
                                loadingPunishmentId.buttonType === "delete" ? (
                                  <CircularProgress
                                    style={{ height: "20px", width: "20px" }}
                                    color="secondary"
                                  />
                                ) : (
                                  <DeleteForeverIcon />
                                )}
                              </button>
                            </div>
                          ))}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    style={{
                      fontSize: 18,
                      fontWeight: "lighter",
                      fontStyle: "italic",
                    }}
                  >
                    No open assignments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </>
  );
};

export default GlobalPunishmentPanel;
