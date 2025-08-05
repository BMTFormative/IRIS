// frontend/src/components/Admin/AddUser-mui.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { useState } from "react"
import { 
  Box, 
  Typography, 
  TextField, 
  Stack, 
  FormControlLabel, 
  Checkbox as MuiCheckbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"

import { type UserCreate, UsersService } from "../../client"
import type { ApiError } from "../../client/core/ApiError"
import useCustomToast from "../../hooks/useCustomToast"
import { emailPattern, handleError } from "../../utils"
import { Button } from "../ui/button-mui"
import { Field } from "../ui/field-mui"

interface UserCreateForm extends UserCreate {
  confirm_password: string
}

const AddUser = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UserCreateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
      is_superuser: false,
      is_active: false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: UserCreate) => UsersService.createUser({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User created successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const onSubmit: SubmitHandler<UserCreateForm> = (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      {/* Trigger Button */}
      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        sx={{ my: 2 }}
        onClick={() => setIsOpen(true)}
      >
        Add User
      </Button>

      {/* Dialog */}
      <Dialog 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            Add User
          </DialogTitle>

          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Fill in the form below to add a new user to the system.
            </Typography>

            <Stack spacing={3}>
              {/* Email Field */}
              <Field invalid={!!errors.email} errorText={errors.email?.message}>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  required
                  {...register("email", {
                    required: "Email is required",
                    pattern: emailPattern,
                  })}
                  error={!!errors.email}
                />
              </Field>

              {/* Full Name Field */}
              <Field invalid={!!errors.full_name} errorText={errors.full_name?.message}>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  {...register("full_name")}
                  error={!!errors.full_name}
                />
              </Field>

              {/* Password Field */}
              <Field invalid={!!errors.password} errorText={errors.password?.message}>
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  error={!!errors.password}
                />
              </Field>

              {/* Confirm Password Field */}
              <Field invalid={!!errors.confirm_password} errorText={errors.confirm_password?.message}>
                <TextField
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  {...register("confirm_password", {
                    required: "Please confirm your password",
                    validate: (value) => {
                      const password = getValues().password
                      if (value !== password) {
                        return "Passwords do not match"
                      }
                      return true
                    },
                  })}
                  error={!!errors.confirm_password}
                />
              </Field>
            </Stack>

            {/* Permissions */}
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.primary">
                Permissions
              </Typography>
              
              <Controller
                control={control}
                name="is_superuser"
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <MuiCheckbox
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Is superuser?"
                  />
                )}
              />
              
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <MuiCheckbox
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Is active?"
                  />
                )}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  )
}

export default AddUser