import React from "react"
import {
  Dialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

// Types for dialog sizing (matching Chakra UI patterns)
type DialogSize = "xs" | "sm" | "md" | "lg" | "xl" | "full"
type DialogPlacement = "center" | "top" | "bottom"

interface DialogRootProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (params: { open: boolean }) => void
  size?: DialogSize | { base: DialogSize; md?: DialogSize }
  placement?: DialogPlacement
  role?: "dialog" | "alertdialog"
}

interface DialogContentProps {
  children: React.ReactNode
  sx?: any
}

interface DialogHeaderProps {
  children: React.ReactNode
}

interface DialogBodyProps {
  children: React.ReactNode
}

interface DialogFooterProps {
  children: React.ReactNode
  gap?: number
}

interface DialogTriggerProps {
  children: React.ReactElement<any>
  asChild?: boolean
}

interface DialogCloseTriggerProps {
  children?: React.ReactNode
}

interface DialogActionTriggerProps {
  children: React.ReactElement<{ onClick?: (e: any) => void }>
  asChild?: boolean
}

// Helper function to get dialog max width based on size
const getDialogMaxWidth = (size: DialogSize): string => {
  const sizeMap: Record<DialogSize, string> = {
    xs: "320px",
    sm: "400px", 
    md: "500px",
    lg: "700px",
    xl: "900px",
    full: "100vw",
  }
  return sizeMap[size] || sizeMap.md
}

// Helper function to resolve responsive size
const resolveSize = (size: DialogSize | { base: DialogSize; md?: DialogSize }, isMd: boolean): DialogSize => {
  if (typeof size === "string") return size
  return isMd && size.md ? size.md : size.base
}

// Dialog Root - Main dialog wrapper
export const DialogRoot: React.FC<DialogRootProps> = ({
  children,
  open,
  onOpenChange,
  size = "md",
  placement = "center",
  role = "dialog",
}) => {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"))
  
  const resolvedSize = resolveSize(size, isMdUp)
  const maxWidth = getDialogMaxWidth(resolvedSize)

  const handleClose = (_: any, reason?: string) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      onOpenChange({ open: false })
    }
  }

  // Store dialog context for child components
  const contextValue = {
    onClose: () => onOpenChange({ open: false }),
    role,
  }

  return (
    <DialogContext.Provider value={contextValue}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            maxWidth,
            width: "100%",
            margin: placement === "top" ? "16px auto auto auto" 
                   : placement === "bottom" ? "auto auto 16px auto"
                   : "auto",
            borderRadius: 2,
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
        aria-labelledby="dialog-title"
        role={role}
      >
        {children}
      </Dialog>
    </DialogContext.Provider>
  )
}

// Context for passing dialog state to child components
const DialogContext = React.createContext<{
  onClose: () => void
  role: string
} | null>(null)

const useDialogContext = () => {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used within DialogRoot")
  }
  return context
}

// Dialog Content - Wrapper for dialog content
export const DialogContent: React.FC<DialogContentProps> = ({ children, sx }) => {
  return (
    <Box sx={sx}>
      {children}
    </Box>
  )
}

// Dialog Header with close button
export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  const { onClose } = useDialogContext()

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 3,
        pb: 1,
      }}
    >
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
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
export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MuiDialogTitle
      id="dialog-title"
      sx={{
        p: 0,
        fontSize: "1.25rem",
        fontWeight: 600,
      }}
    >
      {children}
    </MuiDialogTitle>
  )
}

// Dialog Body
export const DialogBody: React.FC<DialogBodyProps> = ({ children }) => {
  return (
    <MuiDialogContent
      sx={{
        px: 3,
        pb: 1,
      }}
    >
      {children}
    </MuiDialogContent>
  )
}

// Dialog Footer
export const DialogFooter: React.FC<DialogFooterProps> = ({ children, gap = 2 }) => {
  return (
    <DialogActions
      sx={{
        p: 3,
        pt: 2,
        gap: gap * 0.5, // Convert to theme spacing
        justifyContent: "flex-end",
      }}
    >
      {children}
    </DialogActions>
  )
}

// Dialog Trigger - Button or element that opens dialog
export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild = false }) => {
  // Since this is just a trigger, we return the child element as-is
  // The parent component handles the open state
  return asChild ? children : <>{children}</>
}

// Dialog Close Trigger - Close button (already handled in DialogHeader)
export const DialogCloseTrigger: React.FC<DialogCloseTriggerProps> = ({ children }) => {
  // This is handled by the close button in DialogHeader
  // Return null or the children if provided
  return children ? <>{children}</> : null
}

// Dialog Action Trigger - For action buttons (Cancel, etc.)
export const DialogActionTrigger: React.FC<DialogActionTriggerProps> = ({ children, asChild = false }) => {
  const { onClose } = useDialogContext()
  
  if (asChild && React.isValidElement(children)) {
    // Clone the child and add onClick handler
    const existingProps = children.props as Record<string, any>
    return React.cloneElement(children, {
      ...existingProps,
      onClick: (e: any) => {
        existingProps.onClick?.(e)
        onClose()
      },
    })
  }
  
  return <>{children}</>
}

// Dialog Description (for accessibility)
export const DialogDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      {children}
    </Typography>
  )
}

// Export all components with MUI suffix to avoid Chakra conflicts
export {
  DialogRoot as DialogRootMui,
  DialogContent as DialogContentMui,
  DialogHeader as DialogHeaderMui,
  DialogTitle as DialogTitleMui,
  DialogBody as DialogBodyMui,
  DialogFooter as DialogFooterMui,
  DialogTrigger as DialogTriggerMui,
  DialogCloseTrigger as DialogCloseTriggerMui,
  DialogActionTrigger as DialogActionTriggerMui,
  DialogDescription as DialogDescriptionMui,
}

// Also export the original names for future use when Chakra is removed
// export {
//   DialogRoot,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogBody,
//   DialogFooter,
//   DialogTrigger,
//   DialogCloseTrigger,
//   DialogActionTrigger,
//   DialogDescription,
// }