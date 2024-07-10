import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { baseUrl } from "../../utils/jsonData";
import { dateCreateFormat } from "../../helperFunctions/helperFunctions";

const ShoutOutReport = () => {
  const loggedInUser = sessionStorage.getItem("email");

  const [listOfPunishments, setListOfPunishments] = useState([]);

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const url = `${baseUrl}/punish/v1/punishments`;

  useEffect(() => {
    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setListOfPunishments(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  //Temp Filter, we should filter in backend base on principal user

  const data = listOfPunishments
    // .filter((user) => user.student.studentEmail === loggedInUser)
    .filter((punish) => punish.status === "SO");

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
          Kudos, Lot of People are Talking About You!
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
            <TableCell variant="head" style={{ fontWeight: "bold" }}>
                student
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Notes
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Created By
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Created On
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((x, key) => (
                <TableRow key={key}>
                  <TableCell>{x.studentEmail}</TableCell>
                  <TableCell>{x.infractionDescription}</TableCell>
                  <TableCell>{x.teacherEmail}</TableCell>
                  <TableCell>{dateCreateFormat(x.timeCreated)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5">
                  No Shout Out Yet, but im sure its coming!.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ShoutOutReport;
