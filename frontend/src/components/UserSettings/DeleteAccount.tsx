import React, { useState } from "react"
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { 
  Warning as WarningIcon,
  DeleteForever as DeleteIcon
} from "@mui/icons-material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { type ApiError, UsersService } from "@/client"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const DeleteAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const { logout } = useAuth()

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  const mutation = useMutation({
    mutationFn: () => UsersService.deleteUserMe(),
    onSuccess: () => {
      showSuccessToast("Your account has been successfully deleted")
      setIsDialogOpen(false)
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
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.02) 0%, rgba(244, 67, 54, 0.08) 100%)',
          border: '1px solid rgba(244, 67, 54, 0.12)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <WarningIcon sx={{ color: '#d32f2f', fontSize: '1.5rem' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#d32f2f',
              fontWeight: 600,
            }}
          >
            Danger Zone
          </Typography>
        </Box>

        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>Delete Account</AlertTitle>
          Permanently delete your data and everything associated with your account. 
          <strong> This action cannot be undone.</strong>
        </Alert>

        <Typography variant="body1" sx={{ mb: 3, color: 'text.primary' }}>
          When you delete your account, all of the following will be permanently removed:
        </Typography>

        <Box sx={{ mb: 4, pl: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            • Your profile information and settings
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            • All items and data associated with your account
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            • Your login credentials and access permissions
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            • Any collaborations or shared content
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setIsDialogOpen(true)}
          sx={{
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
          Delete My Account
        </Button>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.02) 0%, rgba(244, 67, 54, 0.08) 100%)',
          }
        }}
      >
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
            onClick={() => setIsDialogOpen(false)}
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
            onClick={handleSubmit(onSubmit)}
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
      </Dialog>
    </Container>
  )
}

export default DeleteAccount