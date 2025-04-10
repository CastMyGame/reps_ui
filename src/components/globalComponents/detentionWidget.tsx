import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { baseUrl } from "../../utils/jsonData";
import jsPDF from "jspdf";
import DetentionTimer from "./detentionTimer/detentionTimer";
import { PunishmentDto } from "src/types/responses";

const DetentionWidget = () => {
  const [data, setData] = useState<PunishmentDto[]>([]);

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const url = `${baseUrl}/student/v1/detentionList/${sessionStorage.getItem("schoolName")}`;

    axios
      .get(url, { headers })
      .then(function (response) {
        const data = response.data;

        setData(data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  // const pdfRef = useRef();

  // const generatePDF = (studentData: PunishmentDto) => {
  //   const pdf = new jsPDF();
  //   // Add logo
  //   // const logoWidth = 50; // Adjust the width of the logo as needed
  //   // const logoHeight = 50; // Adjust the height of the logo as needed
  //   // const logoX = 130; // Adjust the X coordinate of the logo as needed
  //   // const logoY = 15; // Adjust the Y coordinate of the logo as needed

  //   //https://medium.com/dont-leave-me-out-in-the-code/5-steps-to-create-a-pdf-in-react-using-jspdf-1af182b56cee

  //   pdf.setFontSize(16);
  //   pdf.text("Detention List", 105, 40, { align: "center" }); // Adjust coordinates and styling as needed

  //   // Add punishment details table
  //   pdf.autoTable({
  //     startY: 70, // Adjust the Y-coordinate as needed
  //     head: [["Student Id", "Last Name", "First Name"]],
  //     body: studentData.map((student) => [
  //       student.studentEmail.split("@")[0],
  //       student.studentLastName,
  //       student.studentFirstName,
  //     ]),
  //   });

  //   // Save or open the PDF
  //   pdf.save("detention_report.pdf");
  // };

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
          variant="h5"
          style={{
            flexGrow: 1,
            outline: "1px solid white",
            padding: "5px",
            textAlign: "center",
          }}
        >
          Detention list
        </Typography>
      </div>

      <table className="widget-table">
        {" "}
        {/* Added borderCollapse for proper styling */}
        <thead>
          <tr className="widget-table-tr">
            {" "}
            {/* Moved the header row to thead */}
            <th>First Name</th>
            <th>Last Name</th>
            <th>Infraction Period</th>
            <th>Detention Timer</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((x, key) => {
              const rowBackgroundColor = key % 2 === 0 ? "#f2f2f2" : "white"; // Alternate colors

              return (
                <tr key={key} style={{ backgroundColor: rowBackgroundColor }}>
                  <td style={{ paddingRight: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ textAlign: "center", fontSize: "150%" }}>
                        {x.studentFirstName}
                      </span>
                    </div>
                  </td>
                  <td style={{ paddingRight: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ textAlign: "center", fontSize: "150%" }}>
                        {" "}
                        {x.studentLastName}
                      </span>
                    </div>
                  </td>
                  <td style={{ paddingRight: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ textAlign: "center", fontSize: "150%" }}>
                        {x.punishment.classPeriod}
                      </span>
                    </div>
                  </td>
                  <td>
                    <DetentionTimer studentEmail={x.studentEmail} />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No student is assigned Detention.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* <button
        className="widget-print-button"
        onClick={() => {
          generatePDF(data);
        }}
        style={{ backgroundColor: "#CF9FFF" }}
      >
        Print
      </button> */}
    </>
  );
};

export default DetentionWidget;
