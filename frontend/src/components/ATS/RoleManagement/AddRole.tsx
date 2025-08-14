// frontend/src/components/ATS/RoleManagement/AddRole.tsx
import { useState } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
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
  Fab,
  Tooltip,
} from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import { type SubmitHandler, useForm, Controller } from "react-hook-form"

import { ATSService } from "@/client/ats"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import Button from "@mui/material/Button"

interface RoleCreateForm {
  name: string
  description?: string
  permission_ids: string[]
}

const AddRole = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleCreateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      permission_ids: [],
    },
  })

  // Fetch available permissions
  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => ATSService.getPermissions(),
  })

  const mutation = useMutation({
    mutationFn: (data: RoleCreateForm) =>
      ATSService.createRole({
        ...data,
        permission_ids: data.permission_ids,
      }),
    onSuccess: () => {
      showSuccessToast("Role created successfully")
      reset()
      setOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })

  const onSubmit: SubmitHandler<RoleCreateForm> = (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Tooltip title="Add Role" placement="top">
        <Fab
          color="primary"
          aria-label="add role"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
            boxShadow: "0 8px 32px rgba(25, 118, 210, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
              transform: "scale(1.1)",
              boxShadow: "0 12px 40px rgba(25, 118, 210, 0.4)",
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
            color: "white",
            mb: 0,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <AddIcon />
            <Typography variant="h6" component="span">
              Add New Role
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
                placeholder="Enter role name"
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
                variant="outlined"
              />

              <TextField
                {...register("description")}
                label="Description"
                placeholder="Enter role description"
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
              onClick={() => setOpen(false)}
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
              Create Role
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default AddRole








