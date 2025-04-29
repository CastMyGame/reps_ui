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
import { dateCreateFormat } from "../../../helperFunctions/helperFunctions";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { baseUrl } from "src/utils/jsonData";
import axios from "axios";
import { OfficeReferral } from "src/types/responses";

interface OfficeReferralProps {
  data: OfficeReferral[];
}

interface ModalState {
  display: boolean;
  message: string;
  buttonType: string;
  data: OfficeReferral | null; // Allow data to be `OfficeReferral` or `null`
}

const OfficeReferrals: React.FC<OfficeReferralProps> = ({ data }) => {
  const [updatePage, setUpdatePage] = useState(false);
  const [deletePayload, setDeletePayload] = useState<OfficeReferral | null>(
    null
  );
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [textareaValue, setTextareaValue] = useState("");
  const [barOpen, setBarOpen] = useState(true);

  const [openModal, setOpenModal] = useState<ModalState>({
    display: false,
    message: "",
    buttonType: "",
    data: null,
  });

  const [loadingPunishmentId, setLoadingPunishmentId] = useState<{
    id: string | null;
    buttonType: string;
  }>({
    id: null,
    buttonType: "",
  });

  const hasScroll = data?.length > 2;

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const handleUpdatePage = () => {
    setTimeout(() => {
      setUpdatePage((prev) => !prev);
    }, 500);
  };

  const handleClosePunishment = (id: string, description: string) => {
    const payload = { id: id, comment: description };

    const url = `${baseUrl}/officeReferral/v1/closeId`;
    axios
      .post(url, payload, { headers })
      .then((response) => {
        handleUpdatePage();
        setToast({ visible: true, message: "Answers accepted successfully!" });
        setOpenModal({
          display: false,
          message: "",
          buttonType: "",
          data: null,
        });
      })
      .catch((error) => {
        console.error(error);
        setToast({
          visible: true,
          message: "Failed to accept answers. Please try again.",
        });
      });
  };

  const handleRejectPunishment = (obj: OfficeReferral) => {
    setLoadingPunishmentId({
      id: obj.officeReferralId,
      buttonType: "close",
    });
    const url = `${baseUrl}/officeReferral/v1/rejected/${obj.officeReferralId}`;
    axios
      .put(url, null, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({
          visible: true,
          message:
            "You have rejected the student's answers and an email has been sent letting them know.",
        });
        setOpenModal({
          display: false,
          message: "",
          buttonType: "",
          data: null,
        });
      })
      .catch(function (error) {
        console.error(error);
        setToast({
          visible: true,
          message: "Failed to reject answers. Try again.",
        });
      })
      .finally(() => {
        setOpenModal({
          display: false,
          message: "",
          buttonType: "",
          data: null,
        });
        setTimeout(() => {
          setToast({ visible: false, message: "" });
          setLoadingPunishmentId({ id: null, buttonType: "" });
        }, 1000);
      });
  };

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTextareaValue(event.target.value);
  };

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
            display: "inline-block",
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
          Office Managed Referrals
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
              display: "inline-block",
              transform: barOpen ? "translateY(-3px) scale(1.1)" : "scale(1)",
              transition: "transform 0.3s ease",
            }}
            onClick={() => setBarOpen(!barOpen)}
          >
            {barOpen ? "-" : "+"}
          </span>
          <h5 style={{ marginLeft: "20px", fontSize: 24, fontWeight: "bold" }}>
            Office Managed Referrals
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
                Description
              </TableCell>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "20%",
                }}
              >
                Created By
              </TableCell>
              <TableCell
                className="table-header-cell"
                style={{
                  width: "20%",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length > 0 ? (
              data
                ?.filter((x: OfficeReferral) => x.status !== "CLOSED")
                .map((x, key) => (
                  <TableRow key={key.valueOf()}>
                    <TableCell
                      style={{ width: "20%", fontSize: 18, color: "black", whiteSpace: "normal",
                        wordWrap: "break-word",
                        textAlign: "center",
                        verticalAlign: "middle"}}
                    >
                      {dateCreateFormat(x.timeCreated)}
                    </TableCell>
                    <TableCell
                      style={{ width: "20%", fontSize: 18, color: "black", whiteSpace: "normal",
                        wordWrap: "break-word",
                        textAlign: "center",
                        verticalAlign: "middle" }}
                    >
                      {x.studentEmail}{" "}
                    </TableCell>
                    <TableCell
                      style={{ width: "30%", fontSize: 18, color: "black", whiteSpace: "normal",
                        wordWrap: "break-word",
                        textAlign: "center",
                        verticalAlign: "middle" }}
                    >
                      {x.referralDescription}
                    </TableCell>
                    <TableCell
                      style={{ width: "30%", fontSize: 18, color: "black", whiteSpace: "normal",
                        wordWrap: "break-word",
                        textAlign: "center",
                        verticalAlign: "middle" }}
                    >
                      {x.teacherEmail}
                    </TableCell>
                    <TableCell
                      style={{ width: "30%", fontSize: 18, color: "black", whiteSpace: "normal",
                        wordWrap: "break-word",
                        textAlign: "center",
                        verticalAlign: "middle" }}
                    >
                      <>
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
                                "You are attempting to close out this referral. If this was not your intent click cancel. If this is your intent, provide a brief explanation of the remediation being provided and click Close",
                              buttonType: "close",
                              data: x,
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
                            Review Answers
                          </p>
                          <CheckBoxIcon />
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
                                "You are attempting to delete the record of this referral. If you were attempting to close out the referral please click cancel and hit the “Close Referral” button. If you still want to delete the record of this referral, provide a brief explanation for this action and click Delete Referral.",
                              buttonType: "delete",
                              data: x,
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
                          <DeleteForeverIcon />
                        </button>
                      </>
                    </TableCell>
                  </TableRow>
                ))
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
                  No Office Referrals yet, hope it stays that way!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>{" "}
      {openModal.display && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{openModal.message}</h3>
              <div className="answer-container">
                {Array.isArray(openModal?.data?.referralDescription) &&
                  openModal.data?.referralDescription.map(
                    (item: string, index: number) => {
                      if (index > 1) {
                        const match = item.match(
                          /question=([\s\S]+?),\s*answer=([\s\S]+?)(?=\))/
                        );
                        if (match) {
                          const question = match[1].trim();
                          const answer = match[2].trim();

                          return (
                            <div
                              key={index.valueOf()}
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                border: "1px solid black",
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "grey",
                                  minHeight: "15px",
                                  width: "40%",
                                }}
                              >
                                <strong>Question:</strong> {question}
                              </div>
                              <div
                                style={{
                                  color: "black",
                                  backgroundColor: "lightBlue",
                                  minHeight: "50px",
                                  width: "60%",
                                  textAlign: "left",
                                  paddingLeft: "10px",
                                }}
                              >
                                <strong>Answer:</strong> {answer}
                              </div>
                            </div>
                          );
                        }
                      }
                      return null; // Avoid returning undefined inside `.map()`
                    }
                  )}
              </div>
            </div>
            <div className="modal-body">
              <textarea
                value={textareaValue} // Set the value of the textarea to the state variable
                onChange={handleTextareaChange} // Handle changes to the textarea
                className="multi-line-input"
                placeholder="Enter additional comments"
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
                    data: null,
                  });
                  setTextareaValue("");
                }}
              >
                Cancel
              </button>
              <button
                disabled={textareaValue.length === 0}
                style={{
                  backgroundColor: textareaValue === "" ? "grey" : "red",
                }}
                onClick={() => {
                  if (deletePayload) {
                    handleRejectPunishment(deletePayload);
                  }
                }}
              >
                Reject Answers
              </button>
              <button
                disabled={textareaValue.length === 0}
                style={{
                  backgroundColor: textareaValue === "" ? "grey" : "green",
                }}
                onClick={() => {
                  if (deletePayload) {
                    handleClosePunishment(
                      deletePayload?.officeReferralId,
                      textareaValue
                    );
                  }
                }}
              >
                Accept Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfficeReferrals;
