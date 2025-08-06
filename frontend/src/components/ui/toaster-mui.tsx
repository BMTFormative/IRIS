import React, { createContext, useContext, useState, useCallback } from "react"
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide,
  SlideProps,
} from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

// Types for toast system
export type ToastType = "success" | "error" | "warning" | "info" | "loading"

export interface ToastOptions {
  title?: string
  description: string
  type: ToastType
  duration?: number
  closable?: boolean
}

interface ToastItem extends ToastOptions {
  id: string
  open: boolean
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void
  showSuccessToast: (description: string, title?: string) => void
  showErrorToast: (description: string, title?: string) => void
  showWarningToast: (description: string, title?: string) => void
  showInfoToast: (description: string, title?: string) => void
  closeToast: (id: string) => void
}

// Transition component for slide animation
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />
}

// Toast Context
const ToastContext = createContext<ToastContextType | null>(null)

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    const newToast: ToastItem = {
      ...options,
      id,
      open: true,
      duration: options.duration ?? (options.type === "error" ? 6000 : 4000),
      closable: options.closable ?? true,
    }

    setToasts(prev => [...prev, newToast])

    // Auto-close after duration (except for loading toasts)
    if (options.type !== "loading" && newToast.duration > 0) {
      setTimeout(() => {
        closeToast(id)
      }, newToast.duration)
    }
  }, [])

  const showSuccessToast = useCallback((description: string, title = "Success!") => {
    showToast({ title, description, type: "success" })
  }, [showToast])

  const showErrorToast = useCallback((description: string, title = "Something went wrong!") => {
    showToast({ title, description, type: "error" })
  }, [showToast])

  const showWarningToast = useCallback((description: string, title = "Warning!") => {
    showToast({ title, description, type: "warning" })
  }, [showToast])

  const showInfoToast = useCallback((description: string, title = "Info") => {
    showToast({ title, description, type: "info" })
  }, [showToast])

  const closeToast = useCallback((id: string) => {
    setToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, open: false } : toast
      )
    )

    // Remove from array after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 300)
  }, [])

  const contextValue: ToastContextType = {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    closeToast,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Render all toasts */}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={toast.open}
          autoHideDuration={toast.type === "loading" ? null : toast.duration}
          onClose={() => closeToast(toast.id)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          TransitionComponent={SlideTransition}
          sx={{
            // Stack multiple toasts
            top: `${24 + index * 80}px !important`,
            maxWidth: { xs: "calc(100vw - 32px)", sm: "400px" },
          }}
        >
          <Alert
            severity={toast.type === "loading" ? "info" : toast.type}
            variant="filled"
            sx={{
              width: "100%",
              alignItems: "flex-start",
              "& .MuiAlert-message": {
                flex: 1,
                paddingTop: 0.5,
              },
              "& .MuiAlert-action": {
                paddingTop: 0,
                marginRight: -1,
              },
            }}
            action={
              toast.closable ? (
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => closeToast(toast.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null
            }
          >
            {toast.title && (
              <AlertTitle sx={{ marginBottom: 0.5, fontSize: "0.875rem", fontWeight: 600 }}>
                {toast.title}
              </AlertTitle>
            )}
            {toast.description}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  )
}

// Hook to use toast functionality
export const useCustomToast = () => {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error("useCustomToast must be used within a ToastProvider")
  }
  
  return context
}

// Toaster component for backward compatibility
export const Toaster: React.FC = () => {
  // This component is now handled by the ToastProvider
  // Keep it for API compatibility but it doesn't render anything
  return null
}

// Export types and components
// Export types
export type { ToastOptions, ToastType }