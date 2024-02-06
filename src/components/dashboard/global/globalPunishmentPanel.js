import  {useEffect,useState} from 'react'
import * as React from 'react';

import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, TextField, Select, Box, Chip, MenuItem, createTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from "axios"
import { baseUrl } from '../../../utils/jsonData'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { dateCreateFormat } from '../global/helperFunctions';




    const GlobalPunishmentPanel = ({roleType}) => {
      const Alert = React.forwardRef(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
      });

      const [listOfPunishments, setListOfPunishments]= useState([])
      const [sort,setSort] = useState("");
      const [loadingPunihsmentId, setLoadingPunishmentId] = useState({id:null,buttonType:""});
      const [toast,setToast] = useState({visible:false,message:""})
      const [openModal, setOpenModal] = useState({display:false,message:"",buttonType:""})
      const [deletePayload, setDeletePayload] = useState(null)
      const [textareaValue, setTextareaValue] = useState("");
      const [archivedData, setArchivedData] = useState([])
const [filter, setFilter] = useState("OPEN");

const defaultTheme = createTheme();

  
      const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };
      
      const url = `${baseUrl}/punish/v1/punishments`;
      const urlArchive = `${baseUrl}/punish/v1/archived`;

      
  useEffect(()=>{
      setSort(filter)
      
  },[filter])
  
      useEffect(() => {
        axios
          .get(url, { headers }) // Pass the headers option with the JWT token
          .then(function (response) {
            const sortedData = response.data.sort((a, b) => new Date(a.timeCreated) - new Date(b.timeCreated));
            if(roleType==="teacher"){
              const sortedByRole = sortedData.filter(x=>x.teacherEmail === sessionStorage.getItem("email"))
              setListOfPunishments(sortedByRole);   
            
            }
            else{
              const sortedByRole = sortedData;
              setListOfPunishments(sortedByRole);        

            }
      })
          .catch(function (error) {
            console.log(error);
          });

          axios
          .get(urlArchive, { headers }) // Pass the headers option with the JWT token
          .then(function (response) {
            const sortedData = response.data.sort((a, b) => new Date(a.timeCreated) - new Date(b.timeCreated));
            if(roleType==="teacher"){
              const sortedByRole = sortedData.filter(x=>x.teacherEmail === sessionStorage.getItem("email"))
              setArchivedData(sortedByRole);   
            
            }
            else{
        
            }
      })
          .catch(function (error) {
            console.log(error);
          });
      }, [ toast.visible]);

//Merging the punishment and arhcived data

      const data = sort === "ARCHIVED" ? archivedData : (sort === "ALL")? listOfPunishments: listOfPunishments.filter((x)=> x.status === sort);

  
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


      const handleTextareaChange = (event) => {
        setTextareaValue(event.target.value);
      };


      const handleFilterChange = (event) =>{
        setFilter(event.target.value)
      }
    
      const filterOptions = [
        {value:"ALL", label:"All"},
        {value:"OPEN", label:"Open"},
        {value:"CLOSED", label:"Closed"},
        {value:"PENDING", label:"Pending"},
        {value:"FTC", label: "Failure to Complete Work"},
        {value:"REFERRAL", label: "Referral"}

      ]

      const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setToast({visible:false,message:""});
      };

      const handleClosePunishment = (obj) =>{
        setLoadingPunishmentId({id:obj.punishmentId,buttonType:"close"})
        const url = `${baseUrl}/punish/v1/close/${obj.punishmentId}`;
        axios
        .post(url,[textareaValue], { headers }) // Pass the headers option with the JWT token
        .then(function (response) {
          setToast({visible:true,message:"Your Referral was closed"})

        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(()=>{
          setOpenModal({display:false,message:""})
          setTimeout(()=>{
            setToast({visible:false,message:""})
            setLoadingPunishmentId({id:null,buttonType:""})

          },1000)
        }

        );
    };


    //Delete has been changed to archived api
    const handleDeletePunishment = (obj) =>{
      setLoadingPunishmentId({id:obj.punishmentId,buttonType:"delete"})
    
      const url = `${baseUrl}/punish/v1/archived/${sessionStorage.getItem("email")}/${obj.punishmentId}`;
      axios
      .put(url,[textareaValue] , { headers: headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({ visible: true, message: "Your Referral was Deleted" });
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(()=>{
        setOpenModal({display:false,message:""})
        setTextareaValue("")
        setTimeout(()=>{
          setToast({visible:false,message:""})
          setLoadingPunishmentId({id:null,buttonType:""})
        },1000)
      }
        );
  };
  

      return (
          <>
            {openModal.display && <div className="modal-overlay">
  <div className="modal-content">
    <div className='modal-header'>
      <h3 style={{whiteSpace:'normal', wordBreak: 'break-word'}}>{openModal.message}</h3>
    </div>
    <div className='modal-body'>
    <textarea 
        value={textareaValue}       // Set the value of the textarea to the state variable
        onChange={handleTextareaChange} // Handle changes to the textarea
    className="multi-line-input" 
    placeholder="Enter reason for deletion"
    rows={4} // This sets the initial height to show 4 rows
  ></textarea>
    </div>
    <div className='modal-buttons'>

      <button style={{backgroundColor:"red"}} onClick={() => {
        setOpenModal({display:false,message:""})
        setTextareaValue("")}}>Cancel</button>
      {openModal.buttonType==="delete" && <button disabled={textareaValue===""} style={{backgroundColor: textareaValue===""?"grey":'green'}} onClick={() => handleDeletePunishment(deletePayload)}>Delete Referral</button>}
     {openModal.buttonType==="close" && <button disabled={textareaValue.length===""} style={{backgroundColor:textareaValue===""?"grey":"white"}} onClick={() => handleClosePunishment(deletePayload)}>Close Referral</button>}

    </div>
  </div>
</div>}
          
{/*   
     <Typography color="white" variant="h6" style={{ flexGrow: 1, outline:"1px solid  white",padding:
  "5px"}}>
  
  
          </Typography> */}

          <Select
      sx={{ width: '100%',backgroundColor:"white"}}

  labelId="filterSelected"
  value={filter}
  onChange={handleFilterChange}
  renderValue={(selected) => {
    // Check if selected is an array, if not, wrap it in an array
    const selectedArray = Array.isArray(selected) ? selected : [selected];
  
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selectedArray.map((value) => (
          <Chip key={value} label={value} />
        ))}
      </Box>
    );
  }}
  MenuProps={"MenuProps"}
>
  {filterOptions.map((name) => (
    <MenuItem
      key={name.value}
      value={name.value}
    >
      {name.label}
    </MenuItem>
  ))}

</Select>

          <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={toast.visible} autoHideDuration={6000} onClose={handleClose}>
  <Alert Close={handleClose} severity="success" sx={{ width: '100%' }}>
    {toast.message}
  </Alert>
</Snackbar>
          <TableContainer component={Paper} style={{ maxHeight: hasScroll ? '75vh' : 'auto', overflowY: hasScroll ? 'scroll' : 'visible' }}>
          <Table>
          <TableHead>
          <TableRow>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
              Name
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Referral Type
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold', maxWidth:"75px", whiteSpace:'normal', wordBreak: 'break-word'}}>
              Description
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
              Level
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Status
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Date Created
            </TableCell>
            <TableCell variant="head" style={{ fontWeight: 'bold' }}>
             Action
            </TableCell>
   
          </TableRow>
        </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((x, key) => {
                  const days = calculateDaysSince(x.timeCreated);
  
                  return (
                    <TableRow
  
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
                      <TableCell style={{maxWidth:"150px", whiteSpace:'normal', wordBreak: 'break-word'}}>{x.infraction.infractionDescription[1]}</TableCell>
                      <TableCell>{x.infraction.infractionLevel}</TableCell>
                      <TableCell>
  <div 
  className={`status-tag ${days >= 4 ? "tag-critical" : days >= 3 ? "tag-danger" : days >= 2 ? "tag-warning" : "tag-good"}`}
  >
    {x.status}
  </div>
</TableCell>

                      <TableCell>{dateCreateFormat(x.timeCreated)}</TableCell>
                      <TableCell>


  {x.archived === false &&(x.status === "OPEN" ?  <><button style={{height:"60px", width:"180px", backgroundColor: "green"}} onClick={() => {  setOpenModal({display:true,message:"You are attempting to remove the restorative assignment and close out a referral. If this was not your intent click cancel. If this is your intent, provide a brief explanation for why the restorative assignment is being removed and click Close",buttonType:"close"})
  setDeletePayload(x)  }}>
    <p style={{marginBottom:"5px", marginTop:"-2%"}}>Close Referral</p>
    {(loadingPunihsmentId.id === x.punishmentId && loadingPunihsmentId.buttonType==="close") ? (
      <CircularProgress style={{height:"20px", width:"20px"}} color="secondary" />
    ) : (
      <CheckBoxIcon/>
    )}
  </button>
  

  <button style={{height:"60px", width:"180px", backgroundColor:"red"}} onClick={() => {   setOpenModal({display:true,message:"You are attempting to delete the record of this referral. If you were attempting to remove the restorative assignment and close out the referral please click cancel and hit the “Close Referral” button. If you still want to delete the record of this referral, provide a brief explanation for this action and click Delete Referral.",buttonType:"delete"})
  setDeletePayload(x) }}>
    <p style={{marginBottom:"5px", marginTop:"-2%"}}>Delete Referral</p>
    {(loadingPunihsmentId.id === x.punishmentId && loadingPunihsmentId.buttonType==="delete") ? (
      <CircularProgress style={{height:"20px", width:"20px"}} color="secondary" />
    ) : (
      <DeleteForeverIcon/>
    )}
  </button></> : <> <button style={{height:"45px", width:"90px",backgroundColor:"red"}} onClick={() => {   setOpenModal({display:true,message:"You are attempting to delete the record of this referral. If you were attempting to remove the restorative assignment and close out the referral please click cancel and hit the “Close Referral” button. If you still want to delete the record of this referral, provide a brief explanation for this action and click Delete Referral.",buttonType:"delete"})
  setDeletePayload(x) }}>
    {(loadingPunihsmentId.id === x.punishmentId && loadingPunihsmentId.buttonType==="delete") ? (
      <CircularProgress style={{height:"20px", width:"20px"}} color="secondary" />
    ) : (
      <DeleteForeverIcon/>
    )}
  </button></>)     }                
 

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

export default GlobalPunishmentPanel;