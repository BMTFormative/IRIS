import {
  Box,
  Container,
  Paper,
  Typography,
} from "@mui/material"
import { LockOutlined } from "@mui/icons-material"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, LoginService, type NewPassword } from "@/client"
import { Button } from "@/components/ui/button-mui"
import { PasswordInput } from "@/components/ui/password-input-mui"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "@/utils"

interface NewPasswordForm extends NewPassword {
  confirm_password: string
}

export const Route = createFileRoute("/reset-password-mui")({
  component: ResetPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function ResetPassword() {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<NewPasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
    },
  })
  const { showSuccessToast } = useCustomToast()
  const navigate = useNavigate()

  const resetPassword = async (data: NewPassword) => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) return
    await LoginService.resetPassword({
      requestBody: { new_password: data.new_password, token: token },
    })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      showSuccessToast("Password updated successfully.")
      reset()
      navigate({ to: "/login" })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    mutation.mutate(data)
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
            Reset Password
          </Typography>

          {/* Description */}
          <Typography 
            variant="body1" 
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 2,
            }}
          >
            Please enter your new password and confirm it to reset your password.
          </Typography>

          {/* New Password Field */}
          <PasswordInput
            type="new_password"
            placeholder="New Password"
            startElement={<LockOutlined />}
            errors={errors}
            {...register("new_password", passwordRules())}
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
            loading={mutation.isPending}
            sx={{
              mt: 2,
              py: 1.5,
            }}
          >
            Reset Password
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}