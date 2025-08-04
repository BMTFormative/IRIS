// frontend/src/routes/login-mui.tsx
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
  FormControl,
  FormHelperText,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
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
import Logo from "/assets/images/fastapi-logo.svg";
import { emailPattern, passwordRules } from "../utils";

export const Route = createFileRoute("/login-mui")({
  component: LoginMUI,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function LoginMUI() {
  const { loginMutation, error, resetError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src={Logo}
          alt="FastAPI logo"
          sx={{
            height: "auto",
            maxWidth: 200,
            mb: 3,
          }}
        />

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
          {/* Email Field */}
          <FormControl fullWidth margin="normal" error={!!errors.username}>
            <TextField
              id="username"
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              {...register("username", {
                required: "Username is required",
                pattern: emailPattern,
              })}
              error={!!errors.username || !!error}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            {(errors.username || error) && (
              <FormHelperText>
                {errors.username?.message || (error && "Invalid credentials")}
              </FormHelperText>
            )}
          </FormControl>

          {/* Password Field */}
          <FormControl fullWidth margin="normal" error={!!errors.password}>
            <TextField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              {...register("password", passwordRules())}
              error={!!errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            {errors.password && (
              <FormHelperText>{errors.password.message}</FormHelperText>
            )}
          </FormControl>

          {/* Forgot Password Link */}
          <Box sx={{ textAlign: "left", mb: 2 }}>
            <Link
              component={RouterLink}
              to="/recover-password"
              variant="body2"
              color="primary"
              sx={{ textDecoration: "none" }}
            >
              Forgot Password?
            </Link>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              mt: 2,
              mb: 3,
              py: 1.5,
              position: "relative",
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Log In"
            )}
          </Button>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/signup"
                color="primary"
                sx={{ textDecoration: "none", fontWeight: 500 }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}