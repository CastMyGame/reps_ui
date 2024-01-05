import react, {useEffect,useState} from 'react'
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ContactsIcon from '@mui/icons-material/Contacts';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from "axios"
import { baseUrl } from '../../../utils/jsonData'






   const DetentionWidget = () => {

    const [listOfPunishments, setListOfPunishments]= useState([])
    const [filterData, setFilterData] = useState();
    const [sort,setSort] = useState("OPEN");

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    
    const url = `${baseUrl}/punish/v1/punishments`;
    

    useEffect(() => {
      axios
        .get(url, { headers }) // Pass the headers option with the JWT token
        .then(function (response) {
          const sortedData = response.data.sort((a, b) => new Date(a.timeCreated) - new Date(b.timeCreated));
          setListOfPunishments(sortedData);        })
        .catch(function (error) {
          console.log(error);
        });
    }, []);

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
    


    // if(sort == "ALL"){
    //   setFilterData(listOfPunishments);
  
  const data = listOfPunishments.filter((punishment) => {
    const days = calculateDaysSince(punishment.timeCreated);
    return (days > 1 && days <3) && punishment.status === "OPEN"; // This will filter out records that are NOT older than 3 days
  });

  // Use the olderThanThreeDays list for rendering instead of data

    const hasScroll = data.length > 10;

 
    return (
      <>
        <div style={{ backgroundColor: "rgb(25, 118, 210)", marginTop: "10px", marginBlock: "5px" }}>
          <Typography color="white" variant="h6" style={{ flexGrow: 1, outline: "1px solid white", padding: "5px" }}>
            Detention list
          </Typography>
        </div>
    
        <table className='widget-table'> {/* Added borderCollapse for proper styling */}
          <thead>
            <tr className="widget-table-tr"> {/* Moved the header row to thead */}
              <th>Name</th>
              <th>Infraction</th>
              <th>Inf Period</th>
            </tr>
          </thead>
    
          <tbody>
            {data.length > 0 ? (
              data.map((x, key) => {
                const days = calculateDaysSince(x.timeCreated);
                const rowBackgroundColor = key % 2 === 0 ? "#f2f2f2" : "white"; // Alternate colors

                return (
                  <tr key={key}
                  style={{ backgroundColor: rowBackgroundColor }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>{x.student.firstName} {x.student.lastName}</span>
                      </div>
                    </td>
                    <td>{x.infraction.infractionName}</td>
                    <td>{x.classPeriod}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>No student is assigned Detention.</td>
              </tr>
            )}
          </tbody>
        </table>
      </>
    );
            }
    
export default DetentionWidget;