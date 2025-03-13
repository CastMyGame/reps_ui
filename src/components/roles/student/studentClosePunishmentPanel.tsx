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
import React from "react";
import { TeacherReferral } from "src/types/responses";

interface StudentClosedProps {
  listOfPunishments: TeacherReferral[];
}

const StudentClosedPunishmentPanel: React.FC<StudentClosedProps> = ({ listOfPunishments }) => {
  const loggedInUser = sessionStorage.getItem("email") ?? "";

  const data = listOfPunishments
    .filter(
      (user) => user.studentEmail.toLowerCase() === loggedInUser.toLowerCase()
    )
    .filter((punish) => punish.status === "CLOSED" || punish.status === "CFR");

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
          History
        </Typography>
      </div>

      <TableContainer
        component={Paper}
        style={{
          maxHeight: hasScroll ? "100%" : "auto",
          overflowY: hasScroll ? "scroll" : "visible",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
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
                style={{ fontWeight: "bold", fontSize: "2rem" }}
              >
                Level
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: "2rem" }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((x, key) => (
                <TableRow key={key.valueOf()}>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.infractionName}
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.infractionDescription}
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.infractionLevel}
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.status}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>No Records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default StudentClosedPunishmentPanel;
