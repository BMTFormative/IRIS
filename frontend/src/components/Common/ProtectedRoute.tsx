// frontend/src/components/Common/ProtectedRoute.tsx - NEW: Route protection
import { ReactNode } from "react"
import { Navigate } from "@tanstack/react-router"
import { Alert, AlertDescription, Box } from "@mui/material"
import { Lock as LockIcon } from "@mui/icons-material"

import { useAuth } from "@/hooks/useAuth"

interface ProtectedRouteProps {
  children: ReactNode
  permissions?: string[]
  roles?: string[]
  requireAll?: boolean
  fallbackPath?: string
  showError?: boolean
}

export const ProtectedRoute = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallbackPath = "/",
  showError = true,
}: ProtectedRouteProps) => {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, isAuthenticated } = useAuth()

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Check permissions
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    
    if (!hasRequiredPermissions) {
      if (showError) {
        return (
          <Box sx={{ p: 4 }}>
            <Alert severity="error" icon={<LockIcon />}>
              <AlertDescription>
                You don't have sufficient permissions to access this page.
                {permissions.length === 1 
                  ? ` Required permission: ${permissions[0]}`
                  : ` Required permissions: ${permissions.join(", ")}`
                }
              </AlertDescription>
            </Alert>
          </Box>
        )
      }
      return <Navigate to={fallbackPath} />
    }
  }

  // Check roles
  if (roles.length > 0) {
    if (!hasAnyRole(roles)) {
      if (showError) {
        return (
          <Box sx={{ p: 4 }}>
            <Alert severity="error" icon={<LockIcon />}>
              <AlertDescription>
                You don't have the required role to access this page.
                Required roles: {roles.join(", ")}
              </AlertDescription>
            </Alert>
          </Box>
        )
      }
      return <Navigate to={fallbackPath} />
    }
  }

  return <>{children}</>
}