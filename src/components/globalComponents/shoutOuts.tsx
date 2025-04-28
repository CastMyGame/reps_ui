import React, { useState } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { dateCreateFormat } from "../../helperFunctions/helperFunctions";
import { AdminOverviewDto, TeacherOverviewDto } from "src/types/responses";

interface ShoutOutsProps {
  data: TeacherOverviewDto | AdminOverviewDto;
}

const ShoutOuts: React.FC<ShoutOutsProps> = ({ data = {} }) => {
  const [barOpen, setBarOpen] = useState(true);

  const hasScroll = (data.shoutOutsResponse?.length ?? 0) > 2;

  return !barOpen ? (
    <div className="shout-out-bar-container">
      <div className="bar-content">
        <span
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            cursor: "pointer",
            userSelect: "none",
            marginTop: "3px",
            display: "inline-block", // important for transform to work correctly
            transform: barOpen ? "translateY(-3px) scale(1.1)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
          onClick={() => setBarOpen(!barOpen)}
        >
          {barOpen ? "-" : "+"}
        </span>
        <h5
          style={{
            marginLeft: "20px",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Positive Behavior | Wallet: {data.teacher?.currency}{" "}
          {data.school?.currency}
        </h5>
      </div>
    </div>
  ) : (
    <>
      <div className="bar-container open">
        <div className="bar-content">
          <span
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              cursor: "pointer",
              userSelect: "none",
              marginTop: "3px",
              display: "inline-block", // important for transform to work correctly
              transform: barOpen ? "translateY(-3px) scale(1.1)" : "scale(1)",
              transition: "transform 0.3s ease",
            }}
            onClick={() => setBarOpen(!barOpen)}
          >
            {barOpen ? "-" : "+"}
          </span>
          <h5 style={{ marginLeft: "20px", fontSize: 24, fontWeight: "bold" }}>
            Positive Behavior | Wallet: {data.teacher?.currency}{" "}
            {data.school?.currency}
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
        <Table className="shoutouts-table">
          <TableHead>
            <TableRow>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "20%",
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
                Student
              </TableCell>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "20%",
                }}
              >
                Shout Outs
              </TableCell>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "20%",
                }}
              >
                Created By
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.shoutOutsResponse || []).length > 0 ? (
              data.shoutOutsResponse?.map((x, key) => (
                <TableRow key={key.valueOf()}>
                  <TableCell
                    style={{ width: "20%", fontSize: 14, color: "black" }}
                  >
                    {dateCreateFormat(x.timeCreated)}
                  </TableCell>
                  <TableCell
                    style={{ width: "20%", fontSize: 14, color: "black" }}
                  >
                    {x.studentFirstName} {x.studentLastName}{" "}
                  </TableCell>
                  <TableCell
                    style={{ width: "30%", fontSize: 14, color: "black" }}
                  >
                    {x.infractionDescription}
                  </TableCell>
                  <TableCell
                    style={{ width: "30%", fontSize: 14, color: "black" }}
                  >
                    {x.teacherEmail}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
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
