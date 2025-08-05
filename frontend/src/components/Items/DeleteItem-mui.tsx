// frontend/src/components/Items/DeleteItem-mui.tsx
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material"

import { ItemsService } from "../../client"
import type { ApiError } from "../../client/core/ApiError"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { Button } from "../ui/button-mui"

interface DeleteItemProps {
  id: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DeleteItem = ({ id, open, onOpenChange }: DeleteItemProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => ItemsService.deleteItem({ id }),
    onSuccess: () => {
      showSuccessToast("Item deleted successfully")
      onOpenChange(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      setIsDeleting(false)
    },
  })

  const handleDelete = () => {
    setIsDeleting(true)
    deleteItemMutation.mutate(id)
  }

  return (
    <Dialog 
      open={open} 
      onClose={() => onOpenChange(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Delete Item
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          Are you sure you want to delete this item? This action cannot be undone.
        </Typography>
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
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteItem