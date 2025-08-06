// frontend/src/components/Admin/EditUser-mui.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
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
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";

import { type UserPublic, type UserUpdate, UsersService } from "@/client";
import type { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import { emailPattern, handleError } from "@/utils";
import Button from "@mui/material/Button";
import { Field } from "../ui/field-mui";

interface EditUserProps {
  user: UserPublic;
}

interface UserUpdateForm extends UserUpdate {
  confirm_password?: string;
}

const EditUser = ({ user }: EditUserProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...user,
      password: "",
      confirm_password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: UserUpdateForm) =>
      UsersService.updateUser({ userId: user.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onSubmit: SubmitHandler<UserUpdateForm> = (data) => {
    // Remove empty password field
    if (data.password === "") {
      delete data.password;
      delete data.confirm_password;
    }
    mutation.mutate(data);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="text"
        startIcon={<EditIcon />}
        color="inherit"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Edit User
      </Button>

      {/* Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Edit User</DialogTitle>

          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Update the user details below.
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
              <Field
                invalid={!!errors.full_name}
                errorText={errors.full_name?.message}
              >
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  {...register("full_name")}
                  error={!!errors.full_name}
                />
              </Field>

              {/* Password Field */}
              <Field
                invalid={!!errors.password}
                errorText={errors.password?.message}
              >
                <TextField
                  label="Password (leave blank to keep current)"
                  type="password"
                  variant="outlined"
                  fullWidth
                  {...register("password", {
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  error={!!errors.password}
                />
              </Field>

              {/* Confirm Password Field */}
              <Field
                invalid={!!errors.confirm_password}
                errorText={errors.confirm_password?.message}
              >
                <TextField
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  {...register("confirm_password", {
                    validate: (value) => {
                      const password = getValues().password;
                      if (password && value !== password) {
                        return "Passwords do not match";
                      }
                      return true;
                    },
                  })}
                  error={!!errors.confirm_password}
                />
              </Field>

              {/* Permissions */}
              <Stack spacing={2} sx={{ mt: 2 }}>
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

            <Button type="submit" variant="contained" loading={isSubmitting}>
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default EditUser;
