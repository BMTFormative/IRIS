// frontend/src/components/ui/dialog-mui.tsx
import React from "react"
import {
  Dialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

// Simple types
interface DialogRootProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (params: { open: boolean }) => void
  size?: any // Simplified - just accept any size for now
  placement?: any // Simplified
  role?: "dialog" | "alertdialog"
}

interface DialogContentProps {
  children: React.ReactNode
  sx?: any
}

interface DialogTriggerProps {
  children: React.ReactElement<any>
  asChild?: boolean
}

interface DialogActionTriggerProps {
  children: React.ReactElement<{ onClick?: (e: any) => void }>
  asChild?: boolean
}

// Context for dialog state
const DialogContext = React.createContext<{
  onClose: () => void
} | null>(null)

const useDialogContext = () => {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used within DialogRoot")
  }
  return context
}

// Simplified DialogRoot - just wraps MUI Dialog
const DialogRootComponent: React.FC<DialogRootProps> = ({
  children,
  open,
  onOpenChange,
  size,
  placement,
  role = "dialog",
}) => {
  const handleClose = () => {
    onOpenChange({ open: false })
  }

  const contextValue = {
    onClose: handleClose,
  }

  return (
    <DialogContext.Provider value={contextValue}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        role={role}
      >
        {children}
      </Dialog>
    </DialogContext.Provider>
  )
}

// Dialog Content - Simple wrapper
const DialogContentComponent: React.FC<DialogContentProps> = ({ children, sx }) => {
  return <Box sx={sx}>{children}</Box>
}

// Dialog Header with close button
const DialogHeaderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { onClose } = useDialogContext()

  return (
    <Box sx={{ position: 'relative', p: 3, pb: 1 }}>
      {children}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  )
}

// Dialog Title
const DialogTitleComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MuiDialogTitle sx={{ p: 0, fontSize: "1.25rem", fontWeight: 600 }}>
      {children}
    </MuiDialogTitle>
  )
}

// Dialog Body
const DialogBodyComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MuiDialogContent sx={{ px: 3, pb: 1 }}>
      {children}
    </MuiDialogContent>
  )
}

// Dialog Footer
const DialogFooterComponent: React.FC<{ children: React.ReactNode; gap?: number }> = ({ 
  children, 
  gap = 2 
}) => {
  return (
    <DialogActions sx={{ p: 3, pt: 2, gap: gap * 0.5, justifyContent: "flex-end" }}>
      {children}
    </DialogActions>
  )
}

// Dialog Trigger - Just returns children
const DialogTriggerComponent: React.FC<DialogTriggerProps> = ({ children, asChild = false }) => {
  return children
}

// Dialog Close Trigger - Returns null (close handled in header)
const DialogCloseTriggerComponent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return children ? <>{children}</> : null
}

// Dialog Action Trigger - Adds close handler to buttons
const DialogActionTriggerComponent: React.FC<DialogActionTriggerProps> = ({ 
  children, 
  asChild = false 
}) => {
  const { onClose } = useDialogContext()
  
  if (asChild && React.isValidElement(children)) {
    const existingProps = children.props as Record<string, any>
    return React.cloneElement(children, {
      ...existingProps,
      onClick: (e: any) => {
        existingProps.onClick?.(e)
        onClose()
      },
    })
  }
  
  return children
}

// Export components
export const DialogRoot = DialogRootComponent
export const DialogContent = DialogContentComponent
export const DialogHeader = DialogHeaderComponent
export const DialogTitle = DialogTitleComponent
export const DialogBody = DialogBodyComponent
export const DialogFooter = DialogFooterComponent
export const DialogTrigger = DialogTriggerComponent
export const DialogCloseTrigger = DialogCloseTriggerComponent
export const DialogActionTrigger = DialogActionTriggerComponent

// Also export with Mui suffix for compatibility
export const DialogRootMui = DialogRootComponent
export const DialogContentMui = DialogContentComponent
export const DialogHeaderMui = DialogHeaderComponent
export const DialogTitleMui = DialogTitleComponent
export const DialogBodyMui = DialogBodyComponent
export const DialogFooterMui = DialogFooterComponent
export const DialogTriggerMui = DialogTriggerComponent
export const DialogCloseTriggerMui = DialogCloseTriggerComponent
export const DialogActionTriggerMui = DialogActionTriggerComponent