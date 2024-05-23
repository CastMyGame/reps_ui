import React, { useState } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { DateTime } from "luxon";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";

const AdminShoutOut = ({ data = [], school = [], teacher = [] }) => {
  const [barOpen, setBarOpen] = useState(true);

  function parseISOString(s) {
    const date = new DateTime(s);
    var formatted = date.toLocaleString();
    return formatted;
  }

  //We need to fix the cfr issues
  console.log("shoutout", data);

  const hasScroll = data.length > 2;

  data.sort((a, b) => (b.timeCreated - a.timeCreated ? 1 : -1));

  return !barOpen ? (
    <div className="shout-out-bar-container">
      <div className="bar-content">
        <ArrowDropDownCircleIcon
          className="arrowIcon"
          style={{
            transform: "rotate(0deg)",
            cursor: "pointer",
            marginTop: "3px",
          }}
          onClick={() => setBarOpen(true)}
        />{" "}
        <h5 style={{ marginLeft: "20px", fontSize: 24, fontWeight: "bold" }}>
          Positive Behavior | Wallet: {teacher.currency} {school.currency}
        </h5>{" "}
      </div>
    </div>
  ) : (
    <>
      <div className="bar-container open">
        <div className="bar-content">
          <ArrowDropDownCircleIcon
            className="arrowIcon"
            style={{
              transform: "rotate(180deg)",
              cursor: "pointer",
              marginTop: "3px",
            }}
            onClick={() => setBarOpen(false)}
          />{" "}
          <h5 style={{ marginLeft: "20px" }}>
            Positive Behavior | Wallet: {teacher.currency} {school.currency}
          </h5>{" "}
        </div>
      </div>
      <TableContainer
        style={{
          width: "100%",
          height: hasScroll ? "200px" : "auto",
          overflowY: hasScroll ? "scroll" : "visible",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", width: "20%", fontSize: "2rem" }}
              >
                Created On
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", width: "20%", fontSize: "2rem" }}
              >
                Student
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", width: "30%", fontSize: "2rem" }}
              >
                Shout Outs
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", width: "30%", fontSize: "2rem" }}
              >
                Created By
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              (data.map((x, key) => (
                <TableRow key={key}>
                  <TableCell style={{ width: "20%", fontSize: "1.25rem" }}>
                    {parseISOString(x.timeCreated)}
                  </TableCell>
                  <TableCell style={{ width: "20%", fontSize: "1.25rem" }}>
                    {x.studentFirstName} {x.studentLastName}
                  </TableCell>
                  <TableCell style={{ width: "30%", fontSize: "1.25rem" }}>
                    {x.infractionDescription}
                  </TableCell>
                  <TableCell style={{ width: "30%", fontSize: "1.25rem" }}>
                    {x.teacherEmail}
                  </TableCell>
                </TableRow>
              )))
            ) : (
              <TableRow>
                <TableCell colSpan="4">
                  No Shout Out Yet, but I'm sure it's coming!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>{" "}
    </>
  );
};

export default AdminShoutOut;
