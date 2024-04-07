import react, {useEffect,useState} from 'react'
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ContactsIcon from '@mui/icons-material/Contacts';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from "axios"
import { baseUrl } from '../../../utils/jsonData'






    const PunishmentPanel = ({filter}) => {

      const [listOfPunishments, setListOfPunishments]= useState([])
      const [filterData, setFilterData] = useState();
      const [sort,setSort] = useState("");
  
      const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };
      
      const url = `${baseUrl}/punish/v1/punishments`;
      
  
  useEffect(()=>{
      setSort(filter)
      
  },[filter])
  
      useEffect(() => {
        axios
          .get(url, { headers }) // Pass the headers option with the JWT token
          .then(function (response) {
            const sortedData = response.data.sort((a, b) => new Date(a.timeCreated) - new Date(b.timeCreated));
            setListOfPunishments(sortedData);        })
          .catch(function (error) {
            console.error(error);
          });
      }, []);
  
  
      // if(sort == "ALL"){
      //   setFilterData(listOfPunishments);
    
  
      
   
    const data = (sort === "ALL")? listOfPunishments: listOfPunishments.filter((x)=> x.status === sort);
  
  
      const hasScroll = data.length > 10;
  
      const calculateDaysSince = (dateCreated) => {
        const currentDate = new Date();
        const createdDate = new Date(dateCreated);
      
        // Set both dates to UTC
        currentDate.setUTCHours(0, 0, 0, 0);
        createdDate.setUTCHours(0, 0, 0, 0);
      
        const timeDifference = currentDate - createdDate;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        return daysDifference;
      };
      
      return (
          <>
  
           <div style={{backgroundColor:"rgb(25, 118, 210)",marginTop:"10px", marginBlock:"5px"}}>
     <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
  "5px"}}>
  
  
          </Typography>
          </div>
     
          <TableContainer component={Paper} style={{ maxHeight: hasScroll ? '400px' : 'auto', overflowY: hasScroll ? 'scroll' : 'visible' }}>
          <Table>
            <TableHead>
              {/* ... (previous code) */}
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((x, key) => {
                  const days = calculateDaysSince(x.timeCreated);
  
                  return (
                    <TableRow
                      style={{
                        backgroundColor: days >= 4 ? "#A020F0" : days >= 3 ? "#FF402C" : days >= 2 ? "#FFE366" : "#00FF00",
                      }}
                      key={key}
                    >
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <AccountCircleIcon
                            style={{
                              fontSize: '2rem',  // Adjust the size as needed
                              color: 'rgb(25, 118, 210)', // Change the color to blue
                            }}
                          />
                          <span>{x.student.firstName} {x.student.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{x.infraction.infractionName}</TableCell>
                      <TableCell>{x.infraction.infractionDescription}</TableCell>
                      <TableCell>{x.infraction.infractionLevel}</TableCell>
                      <TableCell>{x.status}</TableCell>
                      <TableCell>{days}</TableCell>
                      <TableCell>
                        <ContactsIcon color="primary" />
                        <VisibilityIcon color="primary" />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan="5">No open assignments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

export default PunishmentPanel;