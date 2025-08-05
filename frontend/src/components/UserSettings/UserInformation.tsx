import React, { useState, useEffect } from "react"
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  IconButton,
} from "@mui/material"
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"

import { type ApiError, type UserUpdate, UsersService } from "@/client"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"

type UserUpdateForm = UserUpdate

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [editMode, setEditMode] = useState(false)
  const { user: currentUser } = useAuth()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<UserUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name || "",
      email: currentUser?.email || "",
    },
  })

  // Reset form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      reset({
        full_name: currentUser.full_name || "",
        email: currentUser.email || "",
      })
    }
  }, [currentUser, reset])

  const mutation = useMutation({
    mutationFn: (data: UserUpdateForm) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully")
      setEditMode(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })

  const onSubmit = (data: UserUpdateForm) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    setEditMode(false)
  }

  const toggleEditMode = () => {
    if (editMode) {
      handleSubmit(onSubmit)()
    } else {
      setEditMode(true)
    }
  }

  if (!currentUser) {
    return null
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1976D2',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            Profile Information
          </Typography>
          <IconButton
            onClick={toggleEditMode}
            sx={{
              color: '#1976D2',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Full Name Field */}
            <Controller
              name="full_name"
              control={control}
              rules={{ required: "Full name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  disabled={!editMode}
                  error={!!errors.full_name}
                  helperText={errors.full_name?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: editMode ? '#ffffff' : 'rgba(0, 0, 0, 0.02)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '2px',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: 'transparent',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1976D2',
                    },
                  }}
                />
              )}
            />

            {/* Email Field */}
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: emailPattern,
                  message: "Invalid email format"
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  disabled={!editMode}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: editMode ? '#ffffff' : 'rgba(0, 0, 0, 0.02)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '2px',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: 'transparent',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1976D2',
                    },
                  }}
                />
              )}
            />

            {/* Action Buttons */}
            {editMode && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting || !isDirty}
                  sx={{
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={onCancel}
                  disabled={isSubmitting}
                  sx={{
                    borderColor: '#90A4AE',
                    color: '#90A4AE',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#78909C',
                      color: '#78909C',
                      backgroundColor: 'rgba(144, 164, 174, 0.08)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}

export default UserInformation