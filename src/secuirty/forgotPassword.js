import * as React from 'react';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { baseUrl } from '../utils/jsonData';
import "./modal.css"

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ForgotPassword =(props)=> {
  const [warningToast, setWarningToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
const [alertSeverity, setAlertSeverity] = useState('success');
const [alertMessage, setAlertMessage] = useState('');

  const { token } = useParams();
  const navigate = useNavigate();

  const showToast = (severity, message) => {
    setAlertSeverity(severity);
    setAlertMessage(message);
    setAlertOpen(true);
    setTimeout(() => {
      setAlertOpen(false);
    }, 6000);
  };

  const [formData, setFormData] = useState({
    email: '',
  });

  useEffect(() => {
    const tokenFromUrl = decodeURIComponent(token);
    setFormData((prev) => ({
      ...prev,
      token: tokenFromUrl,
    }));
  }, [token]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
  
    try {
      const response = await axios.post(`${baseUrl}/forgot-password`, {
        email: formData.email,
      });
  
      showToast('success', 'Email has been sent to your email');
      setTimeout(()=>{
        navigate('/login');
      },2000)

    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Invalid Email ,User not in the system');
      setFormData((prev) => ({
        ...prev,
        newPassword: '',
      }));
    } finally {
      setLoading(false);
    }
  };


  return (
        <Box
        className="pop-modal"
        >
          <Avatar sx={{ m: 1, bgcolor: 'grey' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Forgot Your Password?
          </Typography>
          <p>Dont Worry we got you! Please enter a valid school email address</p>
        
          {loading ? (
            <CircularProgress style={{ marginTop: '10px' }} color="secondary" />
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                value={formData.email}
                id="email"
                label="Enter email"
                name="email"
                autoComplete=""
                autoFocus
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
             
              <br />
              <Snackbar open={alertOpen} autoHideDuration={6000}>
  <Alert severity={alertSeverity} sx={{ width: '100%' }}>
    {alertMessage}
  </Alert>
</Snackbar>
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Reset
              </Button>
            </Box>
          )}
        </Box>
  );
}

export default ForgotPassword;
