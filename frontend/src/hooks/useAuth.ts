// frontend/src/hooks/useAuth.ts - EXTENDED with ATS permissions
import { useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { UserPublic } from "@/client"

interface ExtendedUser extends UserPublic {
  roles?: Array<{
    id: string
    name: string
    description?: string
  }>
  permissions?: string[]
  primary_role?: string
}

export const useAuth = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<ExtendedUser>(["currentUser"])

  const userPermissions = useMemo(() => {
    return currentUser?.permissions || []
  }, [currentUser?.permissions])

  const userRoles = useMemo(() => {
    return currentUser?.roles || []
  }, [currentUser?.roles])

  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission))
  }

  const hasRole = (roleName: string): boolean => {
    return userRoles.some(role => role.name === roleName)
  }

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName))
  }

  const isAdmin = (): boolean => {
    return hasAnyPermission(["manage_users", "system_admin"]) || currentUser?.is_superuser || false
  }

  const isSuperAdmin = (): boolean => {
    return hasPermission("system_admin") || currentUser?.is_superuser || false
  }

  const isEmployer = (): boolean => {
    return hasAnyPermission(["create_jobs", "edit_jobs", "delete_jobs"])
  }

  const isCandidate = (): boolean => {
    return hasPermission("view_jobs") && !isEmployer() && !isAdmin()
  }

  const getPrimaryRole = (): string => {
    return currentUser?.primary_role || "user"
  }

  const getAccessLevel = (): "super_admin" | "admin" | "employer" | "candidate" | "limited" => {
    if (isSuperAdmin()) return "super_admin"
    if (isAdmin()) return "admin"  
    if (isEmployer()) return "employer"
    if (isCandidate()) return "candidate"
    return "limited"
  }

  const canAccess = (feature: string): boolean => {
    const featurePermissions: Record<string, string[]> = {
      job_posting: ["create_jobs", "edit_jobs"],
      candidate_management: ["view_candidates", "create_candidates"],
      application_tracking: ["view_applications", "edit_applications"],
      user_management: ["manage_users"],
      system_admin: ["system_admin"],
      analytics: ["view_analytics"],
      ats_management: ["manage_users", "system_admin"],
    }

    const requiredPermissions = featurePermissions[feature]
    if (!requiredPermissions) return false

    return hasAnyPermission(requiredPermissions)
  }

  return {
    currentUser,
    userPermissions,
    userRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isEmployer,
    isCandidate,
    getPrimaryRole,
    getAccessLevel,
    canAccess,
  // Legacy support
  isAuthenticated: !!currentUser,
  isLoading: false, // You might want to implement proper loading state
  }
}

/**
 * Check if a user is currently logged in based on stored access token.
 * This can be used outside of React components (e.g., in route loaders).
 */
export function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem('access_token'));
}

/**
 * React hook providing authentication state and helpers.
 */
export default useAuth;