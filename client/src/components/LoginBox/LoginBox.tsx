import "./LoginBox.css";
import React, { SyntheticEvent, useEffect } from "react";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const LoginBox = () => {
  const baseUri = import.meta.env.VITE_API_URI;
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [open, setOpen] = useState(false);
  const { isAuthenticated, verifyAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: refactor to formData later
    try {
      const response = await fetch(`${baseUri}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username, password: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login failed.");
        setOpen(true);
        return;
      }

      await verifyAuth();
    } catch (error) {
      console.log("An error occurred while trying to log in");
    }
  };

  const handleClose = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <div className="login-box-container">
      <div className="login-box-header">
        <a>Log In</a>
      </div>
      <div className="login-box-form">
        <form onSubmit={handleLogin}>
          <Box
            component="section"
            sx={{
              "& > :not(style)": { m: 1, width: "100%" },
            }}
          >
            <TextField
              id="outlined-controlled-username"
              label="Username"
              value={username}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setUsername(event.target.value);
              }}
            />
            <TextField
              id="outlined-controlled-password"
              label="Password"
              type="password"
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(event.target.value);
              }}
            />
            <div className="login-submit-buttons">
              <div className="button-container">
                <Button fullWidth type="submit" variant="contained">
                  Sign In
                </Button>
                <Snackbar
                  anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  open={open}
                  autoHideDuration={6000}
                  onClose={handleClose}
                >
                  <Alert
                    onClose={handleClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%" }}
                  >
                    {errorMessage}
                  </Alert>
                </Snackbar>
              </div>
            </div>
          </Box>
        </form>
      </div>
    </div>
  );
};

export default LoginBox;
