import axios from 'axios';
import React, { useState } from 'react';
import { baseUrl } from '../utils/jsonData';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
       REPS
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Register() {
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    schoolName: false,
    password: false,
    confirmPassword: false,
  });
  const navigate = useNavigate();
  // const [formData, setFormData] = useState({
  //   firstName: '',
  //   lastName: ' ',
  //   schoolName: ' ',
  //   username: '',
  //   password: '',
  // });

  const [passwordMatches , setPasswordMatches] = useState(false)
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let errors = {
      firstName: false,
      lastName: false,
      email: false,
      schoolName: false,
      password: false,
      confirmPassword: false,
    };
  
    // Check for empty fields and set errors
    if (data.get('firstName') === '') {
      errors.firstName = true;
    }
    if (data.get('lastName') === '') {
      errors.lastName = true;
    }
    if (data.get('email') === '') {
      errors.email = true;
    }
    if (data.get('schoolName') === '') {
      errors.schoolName = true;
    }
    if (data.get('password') === '') {
      errors.password = true;
    }
    if (data.get('confirmPassword') === '') {
      errors.confirmPassword = true;
    }
  
    // Check if passwords match
    if (data.get('password') !== data.get('confirmPassword')) {
      errors.passwordMismatch = true; // Set password mismatch error
    }
  
    // Set formErrors state to trigger error messages
    setFormErrors(errors);
  
    // If there are errors, do not submit the form
    if (Object.values(errors).some((error) => error)) {
      return;
    }

    const payload = {username: data.get('email'),password: data.get('password'),firstName:data.get('firstName'), lastName:data.get('lastName'), schoolName:data.get('schoolName')}

    // Submit the form data if there are no errors

    axios.post(`${baseUrl}/register`,payload)
    .then(function (res){
      setRegistrationSuccessMessage(true)
      setTimeout(()=>{
        navigate("/login")
      },3000)
    })
    .catch(function (error){
      console.error(error);

 });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setPasswordMatches(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
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
              <Snackbar 
                className="" // Add a custom class
              open={registrationSuccessMessage} autoHideDuration={2000} onClose={handleClose}>
  <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
 You have been Registered! ...Redirecting to login
  </Alert>
</Snackbar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  error={formErrors.firstName} // Add error prop
                  helperText={formErrors.firstName && 'First Name is required'} // Add error message
                
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  error={formErrors.lastName} // Add error prop
                  helperText={formErrors.lastName && 'Last Name is required'} // Add error message

                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  error={formErrors.email} // Add error prop
                  helperText={formErrors.email && 'Email is required'} // Add error message

                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="text"
                  label="School Name"
                  name="schoolName"
                  autoComplete="schoolName"
                  error={formErrors.schoolName} // Add error prop
                  helperText={formErrors.schoolName && 'School Name is required'} // Add error message

                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  error={formErrors.password || formErrors.passwordMismatch} // Add error prop
                  helperText={
                    (formErrors.password && 'Password is required') ||
                    (formErrors.passwordMismatch && 'Passwords do not match') // Add error messages
                  }
                
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  error={formErrors.confirmPassword || formErrors.passwordMismatch} // Add error prop
                  helperText={
                    (formErrors.confirmPassword && 'Confirm Password is required') ||
                    (formErrors.passwordMismatch && 'Passwords do not match') // Add error messages
                  }
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}

