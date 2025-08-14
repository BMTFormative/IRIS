import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState, useMemo } from "react"

import { type Body_login_login_access_token, type UserPublic, LoginService, UsersService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "./useCustomToast"
import { handleError } from "@/utils"

interface ExtendedUser extends UserPublic {
  roles?: Array<{
    id: string
    name: string
    description?: string
  }>
  permissions?: string[]
  primary_role?: string
}

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [error, setError] = useState<string | null>(null)

  // Get current user query
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => UsersService.readUserMe(),
    enabled: isLoggedIn(),
    retry: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: Body_login_login_access_token) =>
      LoginService.loginAccessToken({ formData: data }),
    onSuccess: (response) => {
      // Store the access token
      localStorage.setItem("access_token", response.access_token)
      
      // Clear any previous errors
      setError(null)
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      
      // Show success message
      showSuccessToast("Logged in successfully")
      
      // Navigate to dashboard
      navigate({ to: "/" })
    },
    onError: (err: ApiError) => {
      setError("Invalid credentials. Please try again.")
      handleError(err)
    },
  })

  // Enhanced user with permissions (from ATS integration)
  const enhancedUser = useMemo(() => {
    if (!user) return null
    return user as ExtendedUser
  }, [user])

  // Authentication status
  const isAuthenticated = useMemo(() => {
    return Boolean(user && isLoggedIn())
  }, [user])

  // Permission checking functions
  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (!enhancedUser) return false
      if (enhancedUser.is_superuser) return true
      return enhancedUser.permissions?.includes(permission) || false
    }
  }, [enhancedUser])

  const hasAnyPermission = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (!enhancedUser) return false
      if (enhancedUser.is_superuser) return true
      return permissions.some(permission => 
        enhancedUser.permissions?.includes(permission)
      )
    }
  }, [enhancedUser])

  const hasAllPermissions = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (!enhancedUser) return false
      if (enhancedUser.is_superuser) return true
      return permissions.every(permission => 
        enhancedUser.permissions?.includes(permission)
      )
    }
  }, [enhancedUser])

  const hasRole = useMemo(() => {
    return (roleName: string): boolean => {
      if (!enhancedUser) return false
      if (enhancedUser.is_superuser && roleName === "super_admin") return true
      return enhancedUser.roles?.some(role => 
        role.name.toLowerCase() === roleName.toLowerCase()
      ) || false
    }
  }, [enhancedUser])

  const hasAnyRole = useMemo(() => {
    return (roleNames: string[]): boolean => {
      if (!enhancedUser) return false
      return roleNames.some(roleName => hasRole(roleName))
    }
  }, [enhancedUser, hasRole])

  const isAdmin = useMemo(() => {
    return hasRole("admin") || hasRole("super_admin") || Boolean(enhancedUser?.is_superuser)
  }, [hasRole, enhancedUser])

  const canAccess = useMemo(() => {
    return (resource: string): boolean => {
      // Define resource-to-permission mapping
      const resourcePermissions: Record<string, string[]> = {
        "user_management": ["manage_users", "system_admin"],
        "admin_panel": ["system_admin"],
        "ats_management": ["manage_users", "system_admin"],
        "create_jobs": ["create_jobs"],
        "view_jobs": ["view_jobs"],
        "manage_applications": ["manage_applications"],
      }

      const requiredPermissions = resourcePermissions[resource]
      if (!requiredPermissions) return true // No specific permissions required

      return hasAnyPermission(requiredPermissions)
    }
  }, [hasAnyPermission])

  // Logout function
  const logout = () => {
    localStorage.removeItem("access_token")
    queryClient.clear()
    navigate({ to: "/login" })
  }

  // Reset error function
  const resetError = () => {
    setError(null)
  }

  return {
    // Core auth data
    user: enhancedUser,
    loginMutation,
    error,
    resetError,
    logout,
    isLoading,
    
    // Authentication status
    isAuthenticated,
    
    // Permission functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin,
    canAccess,
  }
}

/**
 * Check if a user is currently logged in based on stored access token.
 * This can be used outside of React components (e.g., in route loaders).
 */
export function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem('access_token'))
}

// Export as both default and named export for compatibility
export { useAuth }
export default useAuth