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
import CircularProgress from "@mui/material/CircularProgress";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { baseUrl } from "src/utils/jsonData";
import axios from "axios";

const OfficeReferrals = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [updatePage, setUpdatePage] = useState(false);
  const [referralList, setReferralList] = useState([null]);
  const [deletePayload, setDeletePayload] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [textareaValue, setTextareaValue] = useState("");

  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
    buttonType: "",
    data: null,
  });

  const [loadingPunishmentId, setLoadingPunishmentId] = useState({
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

  const handleClosePunishment = (description, id) => {
    const payload = { id: id, comment: description };

    const url = `${baseUrl}/officeReferral/v1/closeId`;
    axios
      .post(url, payload, { headers })
      .then((response) => {
        console.log(response.data);
        handleUpdatePage();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleRejectPunishment = (obj) => {
    setLoadingPunishmentId({
      id: obj.officeReferral.officeReferralId,
      buttonType: "close",
    });
    const url = `${baseUrl}/officeReferral/v1/rejected/${obj.officeReferral.officeReferralId}`;
    axios
      .put(url, [textareaValue], { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({
          visible: true,
          message:
            "You have rejected the student's answers and an email has been sent letting them know.",
        });
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        setOpenModal({ display: false, message: "" });
        setTimeout(() => {
          setToast({ visible: false, message: "" });
          setLoadingPunishmentId({ id: null, buttonType: "" });
        }, 1000);
      });
  };

  const handleTextareaChange = (event) => {
    setTextareaValue(event.target.value);
  };


  return (
    <>
      {openModal.display && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{openModal.message}</h3>
              <div className="answer-container">
                {openModal.data.officeReferral.infractionDescription.map(
                  (item, index) => {
                    if (index > 1) {
                      const match = item.match(
                        /question=([\s\S]+?),\s*answer=([\s\S]+?)(?=\))/
                      );
                      if (match) {
                        const question = match[1].trim();
                        const answer = match[2].trim();

                        return (
                          <div
                            key={index}
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
                  setOpenModal({ display: false, message: "" });
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
                onClick={() => handleRejectPunishment(deletePayload)}
              >
                Reject Answers
              </button>
              <button
                disabled={textareaValue.length === 0}
                style={{
                  backgroundColor: textareaValue === "" ? "grey" : "green",
                }}
                onClick={() => {
                  handleClosePunishment(deletePayload);
                  console.log(deletePayload);
                }}
              >
                Accept Answers
              </button>
            </div>
          </div>
        </div>
      )}
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
                Description
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", width: "30%", fontSize: 18 }}
              >
                Created By
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", width: "30%", fontSize: 18 }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length > 0 ? (
              data?.map((x, key) => (
                <TableRow key={key}>
                  <TableCell style={{ width: "20%", fontSize: 14 }}>
                    {dateCreateFormat(x.timeCreated)}
                  </TableCell>
                  <TableCell style={{ width: "20%", fontSize: 14 }}>
                    {x.studentEmail}{" "}
                  </TableCell>
                  <TableCell style={{ width: "30%", fontSize: 14 }}>
                    {x.referralDescription}
                  </TableCell>
                  <TableCell style={{ width: "30%", fontSize: 14 }}>
                    {x.teacherEmail}
                  </TableCell>
                  <TableCell style={{ width: "30%", fontSize: 14 }}>
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
                            <DeleteForeverIcon />
                        </button>
                      </>
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
                  No Office Referrals yet, hope it stays that way!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>{" "}
    </>
  );
};

export default OfficeReferrals;

{
  /* <div
  className="task-card"
  onClick={() => setActiveIndex(index)}
  key={index}
  role="button"
>
  <div className="tag">
    <div className="color-stripe"></div>
    <div className="tag-content">
      <div className="index"> {index + 1}</div>
      <div className="date"> {dateCreateFormat(item?.timeCreated)}</div>
    </div>
  </div>

  <div className="card-body">
    <div className="card-body-title">{item?.referralCode.codeName}</div>
    <div className="card-body-description">{item?.referralDescription[0]}</div>
    {/* USE THIS TO MAKE BADGES FOR OFFICE REFERRALS
                               {item.referralDescription &&
                          item.referralDescription[0] !== undefined &&
                          categoryBadgeGenerator(item.referralDescription[0])} 
  </div>
  <div className="card-body">
    <div className="card-body-title">Created By</div>
    <div className="card-body-description">{item?.teacherEmail}</div>
  </div>
  <div className="card-actions">
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
        setDeletePayload(item);
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
      {loadingPunishmentId.id === item.officeReferralId &&
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
        setDeletePayload(item);
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
      {loadingPunishmentId.id === item.officeReferralId &&
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
</div>; */
}
