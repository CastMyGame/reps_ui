import { currencyFailure, confirmedRedemption } from "../../../utils/currency";
import React, { useState, useEffect, useRef } from "react";
import { baseUrl } from "../../../utils/jsonData";
import "./spend-page.css";
import { Button, MenuItem, Select, TextField } from "@mui/material";
import axios from "axios";
import { Student } from "src/types/school";
import { AdminOverviewDto, TeacherOverviewDto } from "src/types/responses";

interface SpendProps {
  data: AdminOverviewDto | TeacherOverviewDto;
}

const SpendPage: React.FC<SpendProps> = ({ data }) => {
  const sending = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shoppingList, setShoppingList] = useState<
    { amount: number; description: string }[]
  >([]);
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);
  const [studentSelect, setStudentSelect] = useState<string | null>(null);
  const [studentPoints, setStudentPoints] = useState<number | null>(null);

  //Gets Students

  const url = `${baseUrl}/student/v1/allStudents`; // Replace with your actual API endpoint

  //Get list Of Students
  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setListOfStudents(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [url]);

  const selectOptions = listOfStudents.map((student) => ({
    value: student.studentEmail, // Use a unique value for each option
    label: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
  }));

  //Grab Select Student Info to Get Points

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    if (studentSelect) {
      const selectStudentUrl = `${baseUrl}/student/v1/email/${studentSelect}`; // Replace with your actual API endpoint
      axios
        .get(selectStudentUrl, { headers }) // Pass the headers option with the JWT token
        .then(function (response) {
          setStudentPoints(response.data.currency);
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  }, [studentSelect]);

  //calculate shopping list points

  //Submit Post
  const handleSubmit = () => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    // Calculate the total points
    const totalPoints = shoppingList.reduce((accu, curr) => {
      return accu + Number(curr.amount);
    }, 0);

    if (sending.current) return;
    if (!studentSelect || !Number.isInteger(totalPoints) || totalPoints <= 0 || totalPoints > (studentPoints ?? -1) || totalPoints > 2147483647) {
      setError("Choose a student and a positive whole redemption amount within their balance."); return;
    }
    sending.current = true; setSubmitting(true); setError("");
    const payload = [
      { studentEmail: studentSelect, currencyTransferred: totalPoints },
    ];

    // Send the POST request with the requestData object
    axios
      .put(`${baseUrl}/employees/v1/currency/spend`, payload, {
        headers: headers,
      })
      .then(function (res) {
        confirmedRedemption(res.data, payload as {studentEmail: string}[]);
        const saved = Array.isArray(res.data) && res.data.find((s: Student) => s.studentEmail === studentSelect);
        if (!saved || !Number.isInteger(saved.currency) || saved.currency < 0) throw new Error("Unconfirmed redemption");
        setStudentPoints(saved.currency);
        window.alert("Redemption Successful");
        setShoppingList([]);
        setStudentSelect(null);
      })
      .catch(function (error) {
        setError(currencyFailure(error));
      }).finally(() => { sending.current = false; setSubmitting(false); });
  };

  const addToCart = (amount: number, description: string) => {
    if (Number.isInteger(amount) && amount > 0 && amount <= 2147483647 && description.trim()) {
      setShoppingList((prev) => [
        ...prev,
        { amount: amount, description: description },
      ]);
      setDescription("");
      setAmount("");
    } else {
      alert("Please enter both amount and description.");
    }
  };
  return (
    <div className="panel-container">
      <div className="form">
        <h1 className="title">Point Redemption</h1>
        {error && <p role="alert">{error}</p>}
        <p>Total redemption: {shoppingList.reduce((total, item) => total + item.amount, 0)}</p>
        <div className="divider"></div>
        <h2 className="center">Select Student</h2>
        <Select disabled={submitting}
          required
          fullWidth
          variant="outlined"
          value={studentSelect}
          onChange={(event) => setStudentSelect(event.target.value)}
          label="Select Student"
        >
          {selectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {studentSelect && (
          <>
            <h3 className="center">Available ${data?.school?.currency}</h3>
            <div
              className={`spend-points-container ${studentPoints ? "spin" : ""}`}
            >
              {studentPoints ?? 0}
            </div>{" "}
          </>
        )}

        {studentSelect && (
          <div className="redemption-input-box">
            <h3 className="center">Redemption</h3>
            <div className="input-box-combo">
              <TextField
                required
                type="number"
                id="redemptionAmount"
                label="Redemption Amount"
                name="redpemptionAmount"
                value={amount}
                onChange={(event) => {
                  const enteredValue = event.target.value;
                  setAmount(enteredValue === "" ? "" : Number(enteredValue));
                }}
                inputProps={{
                  style: {
                    fontSize: "1.5rem", // Font size for the input
                    fontWeight: "bold",
                    backgroundColor: "white",
                    marginRight: "2px",
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: "1.5rem",
                  },
                }}
              />
              <TextField
                required
                fullWidth
                type="text"
                id="redemptionDescription"
                label="Description "
                name="redemptionDescription"
                value={description}
                onChange={(event) => {
                  const enteredValue = event.target.value;
                  setDescription(enteredValue);
                }}
                inputProps={{
                  style: {
                    fontSize: 24, // Font size for the input
                    fontWeight: "bold",
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: 24,
                  },
                }}
              />
            </div>
            <Button disabled={submitting}
              onClick={() => {if (amount !== "") {
                addToCart(Number(amount), description);
              } else {
                alert("Please enter a valid amount.");
              }}}
              variant="contained"
              sx={{ height: "100%", marginTop: "10px", width: "50%" }} // Set explicit height
            >
              Add
            </Button>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {shoppingList.map((item, index) => (
                  <tr key={index.valueOf()}>
                    <td>{item.description}</td>
                    <td>${item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="total-box">
              <div className="total-title">Total</div>
              <div className="total-amount">
                $
                {shoppingList.reduce((accu, curr) => {
                  return accu + Number(curr.amount);
                }, 0)}
              </div>
            </div>

            <Button disabled={submitting}
              type="submit"
              onClick={() => handleSubmit()}
              // color="success"
              variant="contained"
              sx={{ height: "100%", width: "100%", marginTop: "10px" }} // Set explicit height
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendPage;
