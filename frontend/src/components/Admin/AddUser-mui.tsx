import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { useState } from "react"
import { Box, Typography, TextField, Stack } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"

import { type UserCreate, UsersService } from "../../client"
import type { ApiError } from "../../client/core/ApiError"
import useCustomToast from "../../hooks/useCustomToast"
import { emailPattern, handleError } from "../../utils"
import { Button } from "../ui/button-mui"
import { Field } from "../ui/field-mui"
import { Checkbox } from "../ui/checkbox-mui"
import {
  DialogRootMui as DialogRoot,
  DialogTriggerMui as DialogTrigger,
  DialogContentMui as DialogContent,
  DialogHeaderMui as DialogHeader,
  DialogTitleMui as DialogTitle,
  DialogBodyMui as DialogBody,
  DialogFooterMui as DialogFooter,
  DialogActionTriggerMui as DialogActionTrigger,
  DialogCloseTriggerMui as DialogCloseTrigger,
} from "../ui/dialog-mui"

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
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ my: 2 }}>
          Add User
        </Button>
      </DialogTrigger>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: "100%" }}>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Fill in the form below to add a new user to the system.
            </Typography>

            <Stack spacing={3}>
              {/* Email Field */}
              <Field invalid={!!errors.email} errorText={errors.email?.message}>
                <TextField
                  id="email"
                  label="Email"
                  placeholder="Email"
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
                  id="full_name"
                  label="Full Name"
                  placeholder="Full name"
                  variant="outlined"
                  fullWidth
                  {...register("full_name")}
                  error={!!errors.full_name}
                />
              </Field>

              {/* Password Field */}
              <Field invalid={!!errors.password} errorText={errors.password?.message}>
                <TextField
                  id="password"
                  label="Password"
                  placeholder="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                  error={!!errors.password}
                />
              </Field>

              {/* Confirm Password Field */}
              <Field invalid={!!errors.confirm_password} errorText={errors.confirm_password?.message}>
                <TextField
                  id="confirm_password"
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  {...register("confirm_password", {
                    required: "Please confirm your password",
                    validate: (value) => value === getValues().password || "The passwords do not match",
                  })}
                  error={!!errors.confirm_password}
                />
              </Field>
            </Stack>

            {/* Permissions */}
            <Stack spacing={3} sx={{ mt: 3 }}>
              <Controller
                control={control}
                name="is_superuser"
                render={({ field }) => (
                  <Field>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={({ checked }) => field.onChange(checked)}
                    >
                      Is superuser?
                    </Checkbox>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Field>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={({ checked }) => field.onChange(checked)}
                    >
                      Is active?
                    </Checkbox>
                  </Field>
                )}
              />
            </Stack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button variant="outlined" color="inherit" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button type="submit" variant="contained" disabled={!isValid} loading={isSubmitting}>
              Save
            </Button>
          </DialogFooter>

          <DialogCloseTrigger />
        </Box>
      </DialogContent>
    </DialogRoot>
  )
}

export default AddUser