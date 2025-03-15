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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import { baseUrl } from "../../../utils/jsonData";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { TeacherReferral } from "src/types/responses";
import { Student } from "src/types/school";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MuiAlert>
>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const TeacherFTCPanel = () => {
  const [listOfReferrals, setListOfReferrals] = useState<TeacherReferral[]>([]);
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);
  const [toast, setToast] = useState(false);
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setToast(false);
  };

  //Using punihsments to find asscoiated teachers
  const studentUrl = `${baseUrl}/student/v1/allStudents`;
  const punishmentUrl = `${baseUrl}/punish/v1/punishments`;

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    axios
      .get(punishmentUrl, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        //Figure out how we are going to return only students associated with teacher.
        // Maybe only pulling up students with active and closed punishments
        const data = response.data.filter(
          (x: TeacherReferral) =>
            x.teacherEmail === sessionStorage.getItem("email") &&
            x.infractionName === "Failure to Complete Work" &&
            x.status === "PENDING"
        );
        setListOfReferrals(data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [toast, punishmentUrl]);

  const hasScroll = listOfReferrals.length > 10;

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    axios
      .get(studentUrl, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        //Figure out how we are going to return only students associated with teacher.
        // Maybe only pulling up students with active and closed punishments
        setListOfStudents(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [toast, studentUrl]);

  const handleFTCClose = (obj: TeacherReferral) => {
    setLoadingStudentId(obj.punishmentId);
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const url = `${baseUrl}/punish/v1/close/${obj.punishmentId}`;
    axios
      .post(url, [], { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setTimeout(() => {
          setToast(true);
        }, 2000);
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        setToast(false);
        setLoadingStudentId(null);
      });
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
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Assignments FTC
        </Typography>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={toast}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Assignment has been marked Complete
        </Alert>
      </Snackbar>
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
                Name
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Grade
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Description of Work
              </TableCell>
              <TableCell variant="head" style={{ fontWeight: "bold" }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listOfReferrals.length > 0 ? (
              listOfReferrals.map((referral, key) => {
                // Find the corresponding student
                const student = listOfStudents.find(
                  (s) => s.studentEmail === referral.studentEmail
                );

                return student ? (
                  <TableRow key={key.valueOf()}>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <AccountCircleIcon
                          style={{
                            fontSize: "2rem",
                            color: "rgb(25, 118, 210)",
                          }}
                        />
                        <span>
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{student.studentEmail}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{referral.infractionDescription}</TableCell>
                    <TableCell>
                      <button
                        style={{ height: "50px", width: "100px" }}
                        onClick={() => handleFTCClose(referral)}
                      >
                        {loadingStudentId === referral.punishmentId ? (
                          <CircularProgress
                            style={{ height: "20px", width: "20px" }}
                            color="secondary"
                          />
                        ) : (
                          "Mark complete"
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                ) : null; // Skip rendering if student isn't found
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

export default TeacherFTCPanel;
