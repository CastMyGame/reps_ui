import * as React from "react";
import { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { baseUrl } from "../utils/jsonData";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { ContactUsModal } from "./contactUsModal";
import ChatIcon from "@mui/icons-material/Chat";
import JsonData from "../utils/data.json";
import { Navigation } from "../components/landing/navigation";
import { Header } from "../components/landing/header";
import { Features } from "../components/landing/features";
import { About } from "../components/landing/about";
import { Testimonials } from "../components/landing/testimonials";
import "./modal.css";
import ForgotPassword from "./forgotPassword";
import CloseIcon from "@mui/icons-material/Close";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="/">
        REPS
      </Link>{" "}
      {new Date().getFullYear()}
      {'.'}
      version 5.27.24-1
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignIn() {
  const [warningToast, setWarningToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const routeChange = (role) => {
    if (role === "TEACHER") {
      let path = "/dashboard/teacher";
      navigate(path);
    }
    if (role === "STUDENT") {
      let path = "/dashboard/student";
      navigate(path);
    }
    if (role === "ADMIN") {
      let path = "/dashboard/admin";
      navigate(path);
    }
    if (role === "GUIDANCE") {
      let path = "/dashboard/guidance";
      navigate(path);
    }
  };

  const [modalType, setModalType] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [login, setLogin] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setWarningToast(false);
  };

  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      username: data.get("username"),
      password: data.get("password"),
    };
    setLoading(true);

    try {
      const res = await axios.post(`${baseUrl}/auth`, payload);
      if (res.data && res.data.userModel) {
        const token = res.data.response;
        const userName = res.data.userModel.firstName;
        const schoolName = res.data.userModel.schoolName;
        const email = res.data.userModel.username;
        const role = res.data.userModel.roles[0]["role"];
        console.log(role);
        sessionStorage.setItem("Authorization", token);
        sessionStorage.setItem("userName", userName);
        sessionStorage.setItem("schoolName", schoolName);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("role", role);

        routeChange(role);
        setLogin(false);
        setModalType("login");
      } else {
        // Handle the case where the expected data is missing
        console.error(
          "Data or userModel is null or undefined in the response."
        );
        // You can set a warning or error state here if needed
        setLoading(false);
        setWarningToast(true);
        setTimeout(() => {
          setWarningToast(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      setWarningToast(true);
      setTimeout(() => {
        setWarningToast(false);
      }, 2000);
      //
      // Handle the error as needed
    }
  };

  // const setContactUsDisplayModal= () =>{
  //   setModalType("contact")

  // }

  return (
    <ThemeProvider theme={defaultTheme}>
      <div>
        <Navigation setLogin={setLogin} />
        <Header data={landingPageData.Header} />
        <Features data={landingPageData.Features} />
        <About data={landingPageData.About} />
        <Testimonials data={landingPageData.Testimonials} />
      </div>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box className={login ? `pop-modal` : `none`}>
          <CloseIcon
            size="large" // Set size to large
            sx={{ position: "absolute", top: 10, right: 10, width: "15px" }}
            onClick={() => {
              setLogin(false);
              setModalType("login");
            }}
          ></CloseIcon>
          {modalType === "login" && (
            <div className="box-content">
              <Avatar sx={{ m: 1, bgcolor: "grey" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
              {loading ? (
                <CircularProgress
                  style={{ marginTop: "10px" }}
                  color="secondary"
                />
              ) : (
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  noValidate
                  sx={{ mt: 1 }}
                >
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
                      sx: {
                        "&.Mui-focused": { color: "white", marginTop: "-10px" },
                      },
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
                      sx: {
                        "&.Mui-focused": { color: "white", marginTop: "-10px" },
                      },
                    }}
                  />
                  {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
                  <br />
                  <Snackbar
                    open={warningToast}
                    autoHideDuration={6000}
                    onClose={handleClose}
                  >
                    <Alert
                      onClose={handleClose}
                      severity="error"
                      sx={{ width: "100%" }}
                    >
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
                      <p
                        onClick={() => setModalType("reset")}
                        style={{ color: "grey" }}
                      >
                        Forgot password?
                      </p>
                    </Grid>
                    <Grid item>
                      <Link
                        href="/register"
                        variant="body2"
                        style={{ color: "grey" }}
                      >
                        {"Don't have an account? Sign Up"}
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              )}
              <div>
                <ChatIcon
                  onClick={() => setModalType("contact")}
                  sx={{ color: "black", marginTop: "50px", fontSize: "50px" }}
                />
              </div>
              <div style={{ color: "white" }}>Contact Us</div>
            </div>
          )}
          {modalType === "contact" && (
            <ContactUsModal setContactUsDisplayModal={setModalType} />
          )}
          {modalType === "reset" && (
            <ForgotPassword setResetModalDisplay={setModalType} />
          )}
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
