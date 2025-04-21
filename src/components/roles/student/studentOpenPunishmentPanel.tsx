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
import { OfficeReferral, TeacherReferral } from "src/types/responses";

interface StudentOpenProps {
  listOfReferrals: OfficeReferral[];
  listOfPunishments: TeacherReferral[];
  handleStartAssignment: (referral: OfficeReferral | TeacherReferral) => void;
}

const StudentOpenPunishmentPanel: React.FC<StudentOpenProps> = ({
  listOfReferrals,
  listOfPunishments,
  handleStartAssignment,
}) => {
  const loggedInUser = sessionStorage.getItem("email") ?? "";

  const sortedPunishments = listOfPunishments
    .slice()
    .sort((a: TeacherReferral, b: TeacherReferral) => {
      const dateA = new Date(a.timeCreated);
      const dateB = new Date(b.timeCreated);
      return dateA.getTime() - dateB.getTime(); //descending order
    });

  const sortedReferrals = listOfReferrals
    .slice()
    .sort((a: OfficeReferral, b: OfficeReferral) => {
      const dateA = new Date(a.timeCreated);
      const dateB = new Date(b.timeCreated);
      return dateA.getTime() - dateB.getTime(); //descending order
    });

  const handleAssignmentClick = (x: OfficeReferral | TeacherReferral) => {
    handleStartAssignment(x);
  };

  const calculateImportance = (x: TeacherReferral | OfficeReferral) => {
    const currentDate = new Date();
    const creationDate = new Date(x.timeCreated);

    // Calculate the difference in milliseconds
    const timeDifference = currentDate.getTime() - creationDate.getTime();

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

  const punishmentData = sortedPunishments
    .filter(
      (user) => user.studentEmail.toLowerCase() === loggedInUser.toLowerCase()
    )
    .filter(
      (punish) => punish.status === "OPEN" || punish.status === "PENDING"
    );

  const referralData = sortedReferrals
    .filter(
      (user) => user.studentEmail.toLowerCase() === loggedInUser.toLowerCase()
    )
    .filter(
      (punish) => punish.status === "OPEN" || punish.status === "PENDING"
    );

  const hasScroll = punishmentData.length + referralData.length > 10;

  const renderAssignmentAction = (x: OfficeReferral) => {
    if (x.referralCode === null) {
      return <AssignmentIcon />;
    }
    if (x.status === "PENDING") {
      return <Typography color="orange">Pending</Typography>;
    }
    return (
      <Button
        size="small"
        color="success"
        variant="contained"
        onClick={() => handleAssignmentClick(x)}
      >
        Start Assignment
      </Button>
    );
  };

  const renderInfractionAction = (x: TeacherReferral) => {
    if (x.infractionName === "Failure to Complete Work") {
      return <AssignmentIcon />;
    }
    if (x.status === "PENDING") {
      return <Typography color="orange">Pending</Typography>;
    }
    return (
      <Button
        size="small"
        color="success"
        variant="contained"
        onClick={() => handleAssignmentClick(x)}
      >
        Start Assignment
      </Button>
    );
  };

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
          style={{
            flexGrow: 1,
            outline: "1px solid  white",
            padding: "5px",
            backgroundColor: "#25444c",
            textAlign: "center",
            fontSize: 18,
          }}
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
        <Table className="shoutouts-table">
          <TableHead>
            <TableRow>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "10%",
                }}
              ></TableCell>

              <TableCell
                className="table-header-cell"
                style={{
                  width: "20%",
                }}
              >
                Infraction Name
              </TableCell>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "20%",
                }}
              >
                Description
              </TableCell>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "5%",
                }}
              >
                Level
              </TableCell>
              {/* <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Status
            </TableCell> */}
              <TableCell
                className="table-header-cell"
                style={{
                  width: "10%",
                }}
              >
                Created By
              </TableCell>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "10%",
                }}
              >
                Created On
              </TableCell>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "20%",
                }}
              >
                Consequence if not Completed by Tomorrow
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {referralData.length > 0 ? (
              referralData.map((x, key) => (
                <TableRow key={key.valueOf()}>
                  <TableCell style={{ textAlign: "center" }}>
                    <Tooltip
                      title={
                        x.status === "PENDING"
                          ? "Waiting For Teacher To Approve"
                          : "Click to view assignment"
                      }
                    >
                      {renderAssignmentAction(x)}
                    </Tooltip>
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    Office Referral
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.referralDescription[0]}
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
              <></>
            )}
            {punishmentData.length > 0 ? (
              punishmentData.map((x, key) => (
                <TableRow key={key.valueOf()}>
                  <TableCell style={{ textAlign: "center" }}>
                    <Tooltip
                      title={
                        x.status === "PENDING"
                          ? "Waiting For Teacher To Approve"
                          : "Click to view assignment"
                      }
                    >
                      {renderInfractionAction(x)}
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
                  <TableCell
                    style={{ fontSize: "1.5rem", justifyContent: "center" }}
                  >
                    <div style={{ display: "flex" }}>
                      {" "}
                      {x.status === "PENDING" ? "" : calculateImportance(x)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
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
