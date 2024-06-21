import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import { dateCreateFormat } from "../../components/globalComponents/global/helperFunctions";

const ShoutOutWidget = ({ listOfPunishments }) => {
  const loggedInUser = sessionStorage.getItem("email");
  const data = listOfPunishments
    .filter(
      (user) =>
        String(user.studentEmail).toLowerCase() ===
        String(loggedInUser).toLowerCase()
    )
    .filter((punish) => punish.status === "SO" || punish.status === "CFR");

  const hasScroll = data.length > 2;

  return (
    <>
      <div></div>

      <TableContainer
        component={Paper}
        style={{
          height: hasScroll ? "200px" : "auto",
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
                Created On
              </TableCell>

              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: "2rem" }}
              >
                Shout Outs
              </TableCell>
              <TableCell
                variant="head"
                style={{ fontWeight: "bold", fontSize: "2rem" }}
              >
                Created By
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((x, key) => (
                <TableRow key={key}>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {dateCreateFormat(x.timeCreated)}
                  </TableCell>

                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.infractionDescription}
                  </TableCell>
                  <TableCell style={{ fontSize: "1.5rem" }}>
                    {x.teacherEmail}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" style={{ fontSize: "1.5rem" }}>
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

export default ShoutOutWidget;
