import React, { useState } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import { dateCreateFormat } from "../../helperFunctions/helperFunctions";

const ShoutOuts = ({ data = [] }) => {
  const [barOpen, setBarOpen] = useState(true);

  const hasScroll = data.shoutOutsResponse?.length > 2;

  return !barOpen ? (
    <div className="shout-out-bar-container">
      <div className="bar-content">
        <ArrowDropDownCircleIcon
          className="arrowIcon"
          style={{
            transform: "rotate(0deg)",
            cursor: "pointer",
            marginTop: "3px",
            fontSize: "large",
          }}
          onClick={() => setBarOpen(true)}
        />{" "}
        <h5
          style={{
            marginLeft: "20px",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Positive Behavior | Wallet: {data.teacher?.currency} {data.school?.currency}
        </h5>
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
              fontSize: "large",
            }}
            onClick={() => setBarOpen(false)}
          />{" "}
          <h5 style={{ marginLeft: "20px", fontSize: 24, fontWeight: "bold" }}>
            Positive Behavior | Wallet: {data.teacher?.currency} {data.school?.currency}
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
                style={{ fontWeight: "bold", width: "20%", fontSize: 18 }}
              >
                Created On
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", width: "20%", fontSize: 18 }}
              >
                Student
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", width: "30%", fontSize: 18 }}
              >
                Shout Outs
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", width: "30%", fontSize: 18 }}
              >
                Created By
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.shoutOutsResponse?.length > 0 ? (
              data.shoutOutsResponse?.map((x, key) => (
                <TableRow key={key}>
                  <TableCell style={{ width: "20%", fontSize: 14 }}>
                    {dateCreateFormat(x.timeCreated)}
                  </TableCell>
                  <TableCell style={{ width: "20%", fontSize: 14 }}>
                    {x.studentFirstName} {x.studentLastName}{" "}
                  </TableCell>
                  <TableCell style={{ width: "30%", fontSize: 14 }}>
                    {x.infractionDescription}
                  </TableCell>
                  <TableCell style={{ width: "30%", fontSize: 14 }}>
                    {x.teacherEmail}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan="4"
                  style={{
                    fontSize: 18,
                    fontWeight: "lighter",
                    fontStyle: "italic",
                  }}
                >
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

export default ShoutOuts;
