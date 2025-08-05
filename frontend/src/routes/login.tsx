// Modern Blue Gradient Login Component - MUI Version
import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";

import type { Body_login_login_access_token as AccessToken } from "@/client";
import useAuth, { isLoggedIn } from "@/hooks/useAuth";
import Logo from "/assets/images/logoT.png";
import { emailPattern, passwordRules } from "../utils";

export const Route = createFileRoute("/login")({
  component: ModernLogin,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function ModernLogin() {
  const { loginMutation, error, resetError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return;

    resetError();

    try {
      await loginMutation.mutateAsync(data);
    } catch {
      // error is handled by useAuth hook
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, 
          #2196F3 0%, 
          #1976D2 25%, 
          #1565C0 50%, 
          #0D47A1 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Geometric Shapes */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          animation: "float 6s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "60%",
          left: "8%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.15)",
          animation: "float 4s ease-in-out infinite reverse",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "15%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.12)",
          animation: "float 5s ease-in-out infinite reverse",
        }}
      />

      {/* Main Content Container */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            background: "#ffffff",
            display: "flex",
            minHeight: isMobile ? "auto" : 600,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* Left Panel - Welcome Section */}
          <Box
            sx={{
              flex: 1,
              background: `linear-gradient(135deg, 
                #2196F3 0%, 
                #1976D2 50%, 
                #1565C0 100%)`,
              color: "white",
              p: isMobile ? 4 : 6,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              minHeight: isMobile ? 200 : "auto",
            }}
          >
            {/* Decorative Shapes in Left Panel */}
            <Box
              sx={{
                position: "absolute",
                top: "20%",
                right: "10%",
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: "30%",
                left: "15%",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
              }}
            />

            {/* Logo */}
            <Box
              component="img"
              src={Logo}
              sx={{
                height: "auto",
                maxWidth: isMobile ? 150 : 200,
                filter: "brightness(0) invert(1)", // Makes logo white to show on blue background
                animation: "float 6s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0px)" },
                  "50%": { transform: "translateY(-20px)" },
                },
              }}
              margin="auto"
            />

            <Typography
              variant={isMobile ? "h3" : "h2"}
              sx={{
                fontWeight: 700,
                mb: 2,
                letterSpacing: 2,
              }}
            >
              WELCOME
            </Typography>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                fontWeight: 400,
                mb: 3,
                opacity: 0.9,
              }}
            >
              inovAite
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.8,
                lineHeight: 1.6,
                maxWidth: 300,
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
          </Box>

          {/* Right Panel - Login Form */}
          <Box
            sx={{
              flex: 1,
              p: isMobile ? 4 : 6,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: "#333",
              }}
            >
              Sign in
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                mb: 4,
              }}
            ></Typography>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ width: "100%" }}
            >
              {/* User Name Field */}
              <TextField
                fullWidth
                placeholder="User Name"
                variant="outlined"
                margin="normal"
                {...register("username", {
                  required: "Username is required",
                  pattern: emailPattern,
                })}
                error={!!errors.username || !!error}
                helperText={
                  errors.username?.message || (error && "Invalid credentials")
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8f9fa",
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#2196F3",
                    },
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                {...register("password", passwordRules())}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: "#666" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#2196F3",
                          fontWeight: 500,
                          ml: 1,
                          cursor: "pointer",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={handleClickShowPassword}
                      >
                        SHOW
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8f9fa",
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#2196F3",
                    },
                  },
                }}
              />

              {/* Remember Me & Forgot Password Row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: "#666",
                        "&.Mui-checked": {
                          color: "#2196F3",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Remember me
                    </Typography>
                  }
                />
                <Link
                  component={RouterLink}
                  to="/recover-password"
                  variant="body2"
                  sx={{
                    color: "#2196F3",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              {/* Sign In Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  mb: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                  boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
                    boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)",
                  },
                  "&:disabled": {
                    background: "#ccc",
                  },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign in"
                )}
              </Button>

              {/* Sign in with other Button */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                sx={{
                  mb: 3,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "#e0e0e0",
                  color: "#666",
                  "&:hover": {
                    borderColor: "#2196F3",
                    color: "#2196F3",
                    backgroundColor: "rgba(33, 150, 243, 0.04)",
                  },
                }}
              >
                Sign in with other
              </Button>

              {/* Sign Up Link */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Don't have an account?{" "}
                  <Link
                    component={RouterLink}
                    to="/signup"
                    sx={{
                      color: "#2196F3",
                      textDecoration: "none",
                      fontWeight: 600,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
