import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { baseUrl } from '../utils/jsonData';
import { redirect, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { ContactUsModal } from './contactUsModal';
import ChatIcon from '@mui/icons-material/Chat';



const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="/">
        REPS
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
      version 2.29.24.1
    </Typography>
  );
}







// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignIn() {
  const [warningToast,setWarningToast] = useState(false)
  const [loading, setLoading] = useState(false)

  
  const navigate = useNavigate();

  const routeChange =(role)=>{
    if(role === "TEACHER"){
      let path = "/dashboard/teacher";
      navigate(path)
    }
    if(role ==="STUDENT"){
      let path = "/dashboard/student";
      navigate(path)
    }
    if(role ==="ADMIN"){
      let path = "/dashboard/admin";
      navigate(path)
    }
    
  
  }

  const [contactUsDisplayModal,setContactUsDisplayModal] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setWarningToast(false);
  };

  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      username: data.get('username'),
      password: data.get('password')
    }
    setLoading(true);
  
    try {
      const res = await axios.post(`${baseUrl}/auth`, payload);
      if (res.data && res.data.userModel) {
        const token = res.data.response;
        const userName = res.data.userModel.firstName;
    const schoolName = res.data.userModel.schoolName;
    const email = res.data.userModel.username;
    const role = res.data.userModel.roles[0]["role"]
    console.log(role)
    sessionStorage.setItem("Authorization", token);
    sessionStorage.setItem("userName", userName);
    sessionStorage.setItem("schoolName", schoolName);
    sessionStorage.setItem("email", email);
    sessionStorage.setItem("role", role);

    
    routeChange(role);
  
      } else {
        // Handle the case where the expected data is missing
        console.error("Data or userModel is null or undefined in the response.");
        // You can set a warning or error state here if needed
        setLoading(false);
        setWarningToast(true);
        setTimeout(() => {
          setWarningToast(false);
        }, 2000);
        setFormData((prev) => ({
          ...prev,
          password: '',
          username: '',
        }));
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      setWarningToast(true);
      setTimeout(() => {
        setWarningToast(false);
      }, 2000);
      setFormData((prev) => ({
        ...prev,
        password: '',
        username: '',
      }));
      // Handle the error as needed
    }
  };



  return (
    <ThemeProvider theme={defaultTheme}>
      <ContactUsModal setContactUsDisplayModal={setContactUsDisplayModal} contactUsDisplayModal={contactUsDisplayModal}/>
      <Container component="main" maxWidth="xs" >

        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {loading ? <CircularProgress style={{marginTop:"10px"}}  color="secondary" /> :

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Email Address"
              name="username"
              autoComplete="email"
              autoFocus
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
   
              
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              InputLabelProps={{
                sx: {  "&.Mui-focused": { color: "white", marginTop:"-10px" } },
              }}
         
            />
            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
            <br/>
                          <Snackbar open={warningToast} autoHideDuration={6000} onClose={handleClose}>
  <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
   Email or Password is incorrect
  </Alert>
</Snackbar>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="/forgot-password" variant="body2" style={{color:"white"}}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2" style={{color:"white"}}>
                  {"Don't have an account? Sign Up"}
                </Link>

              </Grid>
            </Grid>
          </Box>}
          <div><ChatIcon onClick={()=>setContactUsDisplayModal(true)} sx={{color:"black",marginTop:"50px",fontSize:"50px"}}/></div>
        <div style={{color:"white"}}>Contact Us</div>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} /> 
       
      </Container>
    </ThemeProvider>
  );
}
