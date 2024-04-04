import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, getImageListItemBarUtilityClass } from '@mui/material';
import { dateCreateFormat } from '../global/helperFunctions';

   const ShoutOutWidget = ({listOfPunishments }) => {

    const loggedInUser = sessionStorage.getItem("email")
	  const data = listOfPunishments.filter(user=> String(user.studentEmail).toLowerCase() === String(loggedInUser).toLowerCase()).filter(punish => punish.status === "SO" || punish.status ==="CFR");
      
    const hasScroll = data.length > 2;

    return (
        <>
         <div >
        </div>
   
    <TableContainer component={Paper} style={{ height: hasScroll ? '200px' : 'auto', overflowY: hasScroll ? 'scroll' : 'visible' }}>
      <Table>
        <TableHead>
          <TableRow>
          
          
          <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Created On
            </TableCell>
         
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
              Shout Outs 
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Created By
            </TableCell>

          </TableRow>
        </TableHead>
        <TableBody>




          {data.length > 0 ? (
            data.map((x, key) => (
<TableRow key={key}>
<TableCell>{dateCreateFormat(x.timeCreated)}</TableCell>

  <TableCell>{x.infractionDescription}</TableCell>
  <TableCell>{x.teacherEmail}</TableCell>
</TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="5">No Shout Out Yet, but im sure its coming!.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
    </>
    )
    }

    export default ShoutOutWidget;


