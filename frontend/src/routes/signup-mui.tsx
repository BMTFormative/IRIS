import {
  Box,
  Container,
  Paper,
  Typography,
  Link,
} from "@mui/material"
import { PersonOutline, LockOutlined } from "@mui/icons-material"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import type { UserRegister } from "@/client"
import { Button } from "@/components/ui/button-mui"
import { Field } from "@/components/ui/field-mui"
import { InputGroup } from "@/components/ui/input-group-mui"
import { PasswordInput } from "@/components/ui/password-input-mui"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { confirmPasswordRules, emailPattern, passwordRules } from "@/utils"

export const Route = createFileRoute("/signup-mui")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

interface UserRegisterForm extends UserRegister {
  confirm_password: string
}

function SignUp() {
  const { signUpMutation } = useAuth()
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
  })

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    signUpMutation.mutate(data)
  }

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
          {/* Logo */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Box
              component="img"
              src="/assets/images/fastapi-logo.svg"
              alt="FastAPI logo"
              sx={{
                height: "auto",
                maxWidth: "200px",
                width: "100%",
              }}
            />
          </Box>

          {/* Full Name Field */}
          <Field
            invalid={!!errors.full_name}
            errorText={errors.full_name?.message}
          >
            <InputGroup
              placeholder="Full Name"
              id="full_name"
              type="text"
              {...register("full_name", {
                required: "Full Name is required",
              })}
            >
                <LockOutlined />
                </InputGroup>
          </Field>

          {/* Email Field */}
          <Field
            invalid={!!errors.email}
            errorText={errors.email?.message}
          >
            <InputGroup
              placeholder="Email"
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: emailPattern,
              })}
            >
                <PersonOutline />
            </InputGroup>
          </Field>

          {/* Password Field */}
          <PasswordInput
            type="password"
            placeholder="Password"
            errors={errors}
            {...register("password", passwordRules())}
          >
            <LockOutlined />
            </PasswordInput>
          {/* Confirm Password Field */}
          <PasswordInput
            type="confirm_password"
            placeholder="Confirm Password"
            errors={errors}
            {...register("confirm_password", confirmPasswordRules(getValues))}
          >
            <PersonOutline />
        </PasswordInput>
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
  )
}

export default SignUp