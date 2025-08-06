import { Box, Container, Paper, Typography, Link } from "@mui/material";
import {
  PersonOutline,
  LockOutlined,
  Email as EmailIcon,
} from "@mui/icons-material";
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";

import type { UserRegister } from "@/client";
import Button from "@mui/material/Button";
import { Field } from "@/components/ui/field-mui";
import { InputGroup } from "@/components/ui/input-group-mui";
import { PasswordInput } from "@/components/ui/password-input-mui";
import useAuth, { isLoggedIn } from "@/hooks/useAuth";
import { confirmPasswordRules, emailPattern, passwordRules } from "@/utils";

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      });
    }
  },
});

interface UserRegisterForm extends UserRegister {
  confirm_password: string;
}

function SignUp() {
  const { signUpMutation } = useAuth();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    signUpMutation.mutate(data);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          borderRadius: 2,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              textAlign: "center",
              mb: 2,
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            Signup
          </Typography>

          {/* Full Name Field */}
          <Field
            invalid={!!errors.full_name}
            errorText={errors.full_name?.message}
          >
            <InputGroup
              id="full_name"
              placeholder="Full Name"
              startElement={<PersonOutline />}
              {...register("full_name", {
                required: "Full Name is required",
              })}
            />
          </Field>

          {/* Email Field */}
          <Field invalid={!!errors.email} errorText={errors.email?.message}>
            <InputGroup
              id="email"
              placeholder="Email"
              startElement={<EmailIcon />}
              {...register("email", {
                required: "Email is required",
                pattern: emailPattern,
              })}
            />
          </Field>

          {/* Password Field */}
          <PasswordInput
            type="password"
            placeholder="Password"
            startElement={<LockOutlined />}
            errors={errors}
            {...register("password", passwordRules())}
          />
          {/* Confirm Password Field */}
          <PasswordInput
            type="confirm_password"
            placeholder="Confirm Password"
            startElement={<LockOutlined />}
            errors={errors}
            {...register("confirm_password", confirmPasswordRules(getValues))}
          />
          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            loading={isSubmitting}
            sx={{
              mt: 2,
              mb: 3,
              py: 1.5,
            }}
          >
            Sign Up
          </Button>

          {/* Log In Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                color="primary"
                sx={{ textDecoration: "none", fontWeight: 500 }}
              >
                Log In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default SignUp;
