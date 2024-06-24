import React from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import WarningIcon from "@mui/icons-material/Warning";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { dateCreateFormat } from "src/helperFunctions/helperFunctions";

const StudentOpenPunishmentPanel = ({
  listOfPunishments,
  handleStartAssignment,
}) => {
  const loggedInUser = sessionStorage.getItem("email");

  const sortedData = listOfPunishments.sort((a, b) => {
    const dateA = new Date(a.timeCreated);
    const dateB = new Date(b.timeCreated);
    return dateA - dateB; //descending order
  });

  const handleAssignmentClick = (x) => {
    handleStartAssignment(x);
  };

  const calculateImportance = (x) => {
    const currentDate = new Date();
    const creationDate = new Date(x.timeCreated);

    // Calculate the difference in milliseconds
    const timeDifference = currentDate - creationDate;

    // Calculate the difference in days
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

    // Check if the date is more than 3 days old
    if (daysDifference > 5) {
      return (
        <>
          <WarningIcon color={"error"} />
          <div>ISS </div>
        </>
      );
    } else if (daysDifference > 3) {
      return (
        <>
          <WarningIcon color={"warning"} />
          <div>Lunch Detention</div>
        </>
      );
    }

    // Return null if the date is not more than 3 days old
    return null;
  };

  const data = sortedData
    .filter(
      (user) => user.studentEmail.toLowerCase() === loggedInUser.toLowerCase()
    )
    .filter(
      (punish) => punish.status === "OPEN" || punish.status === "PENDING"
    );

  const hasScroll = data.length > 10;

  return (
    <>
      <div
        style={{
          backgroundColor: "rgb(25, 118, 210)",
          marginTop: "10px",
          marginBlock: "5px",
        }}
      >
        <Typography
          color="white"
          variant="h6"
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Assignments To Complete
        </Typography>
      </div>

      <TableContainer
        component={Paper}
        style={{
          maxHeight: hasScroll ? "400px" : "auto",
          overflowY: hasScroll ? "scroll" : "visible",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold" }}
              ></TableCell>

              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: "2rem" }}
              >
                Infraction Name
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: "2rem" }}
              >
                Description
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: "2rem", width: "5%" }}
              >
                Level
              </TableCell>
              {/* <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Status
            </TableCell> */}
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: "2rem" }}
              >
                Created By
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: "2rem" }}
              >
                Created On
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: "2rem" }}
              >
                Consequence if not Completed by Tomorrow
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((x, key) => (
                <TableRow key={key}>
                  <TableCell style={{ textAlign: "center" }}>
                    <Tooltip
                      title={
                        x.status === "PENDING"
                          ? "Waiting For Teacher To Approve"
                          : "Click to view assignment"
                      }
                    >
                      {x.infractionName === "Failure to Complete Work" ? (
                        <AssignmentIcon />
                      ) : x.status === "PENDING" ? (
                        <Typography color="orange">Pending</Typography>
                      ) : (
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          onClick={() => handleAssignmentClick(x)}
                        >
                          Start Assignment
                        </Button>
                      )}
                    </Tooltip>
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.infractionName}
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.infractionDescription[0]}
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.infractionLevel}
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.teacherEmail}
                  </TableCell>

                  <TableCell style={{ fontSize: "1.5rem" }}>
                    <div style={{ display: "flex" }}>
                      {" "}
                      {dateCreateFormat(x.timeCreated)}
                    </div>
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    <div style={{ display: "flex" }}>
                      {" "}
                      {x.status === "PENDING" ? "" : calculateImportance(x)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5">
                  Great Job, No Assignments are due.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default StudentOpenPunishmentPanel;
