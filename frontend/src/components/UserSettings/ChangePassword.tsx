import React, { useState, useEffect } from "react"
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material"
import { 
  Lock as LockIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon 
} from "@mui/icons-material"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"

import { type ApiError, type UpdatePassword, UsersService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "@/utils"

interface UpdatePasswordForm extends UpdatePassword {
  confirm_password: string
}

const ChangePassword = () => {
  const { showSuccessToast } = useCustomToast()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UpdatePasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  // Ensure form is properly initialized
  useEffect(() => {
    reset({
      current_password: "",
      new_password: "",
      confirm_password: "",
    })
  }, [reset])

  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Password updated successfully.")
      reset()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit = async (data: UpdatePasswordForm) => {
    mutation.mutate(data)
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(25, 118, 210, 0.08) 100%)',
          border: '1px solid rgba(25, 118, 210, 0.12)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <SecurityIcon sx={{ color: '#1976D2', fontSize: '1.5rem' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1976D2',
              fontWeight: 600,
            }}
          >
            Change Password
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ maxWidth: { xs: '100%', md: '400px' } }}>
            {/* Current Password */}
            <Controller
              name="current_password"
              control={control}
              rules={passwordRules()}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Current Password"
                  type={showCurrentPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  error={!!errors.current_password}
                  helperText={errors.current_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#1976D2', fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                          sx={{ color: '#1976D2' }}
                        >
                          {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1976D2',
                    },
                  }}
                />
              )}
            />

            {/* New Password */}
            <Controller
              name="new_password"
              control={control}
              rules={passwordRules()}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  error={!!errors.new_password}
                  helperText={errors.new_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#1976D2', fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          sx={{ color: '#1976D2' }}
                        >
                          {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1976D2',
                    },
                  }}
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              name="confirm_password"
              control={control}
              rules={confirmPasswordRules(getValues)}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#1976D2', fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#1976D2' }}
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1976D2',
                    },
                  }}
                />
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              disabled={!isValid || isSubmitting}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </Stack>
        </form>

        {/* Password Requirements */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: '12px' }}>
          <Typography variant="subtitle2" sx={{ color: '#1976D2', fontWeight: 600, mb: 1 }}>
            Password Requirements:
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            • At least 8 characters long<br />
            • Contains uppercase and lowercase letters<br />
            • Contains at least one number<br />
            • Contains at least one special character
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default ChangePassword