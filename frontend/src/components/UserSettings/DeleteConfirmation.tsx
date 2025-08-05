import React, { useState } from "react"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material"
import { DeleteForever as DeleteIcon, Warning as WarningIcon } from "@mui/icons-material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { type ApiError, UsersService } from "@/client"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const DeleteConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()
  const { logout } = useAuth()

  const mutation = useMutation({
    mutationFn: () => UsersService.deleteUserMe(),
    onSuccess: () => {
      showSuccessToast("Your account has been successfully deleted")
      setIsOpen(false)
      logout()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })

  const onSubmit = async () => {
    mutation.mutate()
  }

  return (
    <>
      <Button
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => setIsOpen(true)}
        sx={{
          mt: 4,
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1.5,
          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        Delete Account
      </Button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.02) 0%, rgba(244, 67, 54, 0.08) 100%)',
          }
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            color: '#d32f2f',
            fontWeight: 600
          }}>
            <WarningIcon />
            Confirmation Required
          </DialogTitle>

          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              All your account data will be <strong>permanently deleted.</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              If you are sure, please click <strong>"Confirm"</strong> to proceed. 
              This action cannot be undone.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              sx={{
                borderColor: '#90A4AE',
                color: '#90A4AE',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  borderColor: '#78909C',
                  color: '#78909C',
                  backgroundColor: 'rgba(144, 164, 174, 0.08)',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="error"
              type="submit"
              disabled={isSubmitting}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
                },
              }}
            >
              {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default DeleteConfirmation