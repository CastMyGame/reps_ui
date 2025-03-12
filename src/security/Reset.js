import * as React from "react";
import { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { baseUrl } from "../utils/jsonData";
import { useNavigate, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ResetPassword = () => {
  const [warningToast, setWarningToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

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
    token: "",
    newPassword: "",
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
      const response = await axios.post(`${baseUrl}/reset-password`, {
        token: formData.token,
        newPassword: formData.newPassword,
      });

      showToast("success", "Password has been successfully changed");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Invalid Token, submit another request for renewal");
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Reset
          </Typography>
          {loading ? (
            <CircularProgress style={{ marginTop: "10px" }} color="secondary" />
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
                value={formData.token}
                id="token"
                label="Enter Reset Token"
                name="token"
                autoComplete=""
                autoFocus
                onChange={(e) =>
                  setFormData({ ...formData, token: e.target.value })
                }
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
              />
              <br />
              <Snackbar open={alertOpen} autoHideDuration={6000}>
                <Alert severity={alertSeverity} sx={{ width: "100%" }}>
                  {alertMessage}
                </Alert>
              </Snackbar>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Reset
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ResetPassword;
