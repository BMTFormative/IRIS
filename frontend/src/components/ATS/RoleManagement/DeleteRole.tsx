// frontend/src/components/ATS/RoleManagement/DeleteRole.tsx
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
} from "@mui/material"
import { Delete as DeleteIcon, Warning as WarningIcon } from "@mui/icons-material"

import { ATSService } from "@/client/ats"
import type { ApiError, RolePublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import Button from "@mui/material/Button"

interface DeleteRoleProps {
  role: RolePublic
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DeleteRole = ({ role, open, onOpenChange }: DeleteRoleProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => ATSService.deleteRole(id),
    onSuccess: () => {
      showSuccessToast("Role deleted successfully")
      onOpenChange(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setIsDeleting(false)
    },
  })

  const handleDelete = () => {
    setIsDeleting(true)
    deleteRoleMutation.mutate(role.id)
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
          color: "white",
          mb: 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <DeleteIcon />
          <Typography variant="h6" component="span">
            Delete Role
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="warning" icon={<WarningIcon />}>
            This action cannot be undone. The role will be permanently deleted.
          </Alert>

          <Typography variant="body1">
            Are you sure you want to delete the role{" "}
            <strong>"{role.name}"</strong>?
          </Typography>

          {role.permissions && role.permissions.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              This role currently has {role.permissions.length} permission(s) assigned.
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          loading={isDeleting}
          startIcon={<DeleteIcon />}
        >
          Delete Role
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteRole