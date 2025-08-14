// frontend/src/components/ATS/RoleManagement/EditRole.tsx
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { type SubmitHandler, useForm, Controller } from "react-hook-form"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
} from "@mui/material"
import { Edit as EditIcon } from "@mui/icons-material"

import { ATSService } from "@/client/ats"
import type { ApiError, RolePublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import Button from "@mui/material/Button"

interface EditRoleProps {
  role: RolePublic
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface RoleUpdateForm {
  name: string
  description?: string
  permission_ids: string[]
}

const EditRole = ({ role, open, onOpenChange }: EditRoleProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: role.name,
      description: role.description || "",
      permission_ids: role.permissions?.map(p => p.id) || [],
    },
  })

  // Fetch available permissions
  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => ATSService.getPermissions(),
  })

  // Reset form when role or dialog state changes
  useEffect(() => {
    if (open) {
      reset({
        name: role.name,
        description: role.description || "",
        permission_ids: role.permissions?.map(p => p.id) || [],
      })
    }
  }, [open, role, reset])

  const mutation = useMutation({
    mutationFn: (data: RoleUpdateForm) =>
      ATSService.updateRole(role.id, data),
    onSuccess: () => {
      showSuccessToast("Role updated successfully")
      onOpenChange(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })

  const onSubmit: SubmitHandler<RoleUpdateForm> = (data) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
          color: "white",
          mb: 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <EditIcon />
          <Typography variant="h6" component="span">
            Edit Role
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              {...register("name", {
                required: "Role name is required",
                minLength: {
                  value: 2,
                  message: "Role name must be at least 2 characters",
                },
              })}
              label="Role Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              variant="outlined"
            />

            <TextField
              {...register("description")}
              label="Description"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
            />

            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Controller
                name="permission_ids"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    label="Permissions"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((value) => {
                          const permission = permissionsData?.data.find(
                            (p) => p.id === value
                          )
                          return (
                            <Chip
                              key={value}
                              label={permission?.name || value}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                                color: "#1976D2",
                              }}
                            />
                          )
                        })}
                      </Box>
                    )}
                  >
                    {permissionsData?.data.map((permission) => (
                      <MenuItem key={permission.id} value={permission.id}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {permission.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {permission.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{
              background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
              },
            }}
          >
            Update Role
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditRole