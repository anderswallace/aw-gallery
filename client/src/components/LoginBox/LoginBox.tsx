import "./LoginBox.css";
import React, { useEffect } from "react";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

const LoginBox = () => {
  const baseUri = import.meta.env.VITE_API_URI;
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { isAuthenticated, verifyAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    } else {
      console.log("Authentication failed");
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
        console.log(errorData.message || "Login failed");
        return;
      }

      await verifyAuth();
    } catch (error) {
      console.log("An error occurred while trying to log in");
    }
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
              id="outlined-controlled-email"
              label="Email"
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
              </div>
            </div>
          </Box>
        </form>
      </div>
    </div>
  );
};

export default LoginBox;
