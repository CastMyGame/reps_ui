import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';

   const StudentClosedPunishmentPanel = ({listOfPunishments =[]}) =>{

    const loggedInUser = sessionStorage.getItem("email")

	  const data = listOfPunishments.filter(user=> (user.studentEmail).toLowerCase() === loggedInUser.toLowerCase()).filter(punish => (punish.status === "CLOSED" || punish.status === "CFR"));
      
    const hasScroll = data.length > 10;

    return (
        <>

                 <div style={{backgroundColor:"rgb(25, 118, 210)",marginTop:"10px", marginBlock:"5px"}}>
   <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
"5px"}}>
  History
        </Typography>
        </div>
   
    <TableContainer component={Paper} style={{ maxHeight: hasScroll ? '100%' : 'auto', overflowY: hasScroll ? 'scroll' : 'visible' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
              Id Number
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
              Infraction Name
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
              Description 
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Level
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>




          {data.length > 0 ? (
            data.map((x, key) => (
<TableRow key={key}>
  <TableCell>
    ***-{x.punishmentId.substring(1,5)}
  </TableCell>
  <TableCell>{x.infractionName}</TableCell>
  <TableCell>{x.infractionDescription}</TableCell>
  <TableCell>{x.infractionLevel}</TableCell>
  <TableCell>{x.status}</TableCell>

</TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="5">No Records found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
    </>
    )
    }

    export default StudentClosedPunishmentPanel;


