// frontend/src/client/ats.ts
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"

export interface RoleCreate {
  name: string
  description?: string
  permission_ids: string[]
}

export interface RoleUpdate {
  name?: string
  description?: string
  permission_ids?: string[]
}

export interface RolePublic {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at?: string
  permissions: PermissionPublic[]
}

export interface RolesPublic {
  data: RolePublic[]
  count: number
}

export interface PermissionCreate {
  name: string
  description?: string
  permission_type: string
}

export interface PermissionUpdate {
  name?: string
  description?: string
  permission_type?: string
  is_active?: boolean
}

export interface PermissionPublic {
  id: string
  name: string
  description?: string
  permission_type: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface PermissionsPublic {
  data: PermissionPublic[]
  count: number
}

export interface UserRoleAssign {
  user_id: string
  role_ids: string[]
}

export interface UserRolePublic {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  is_active: boolean
  role: RolePublic
}

export interface UserRolesPublic {
  data: UserRolePublic[]
  count: number
}

export class ATSService {
  /**
   * Get Roles
   * Retrieve roles (Admin only)
   */
  public static getRoles({
    skip = 0,
    limit = 100,
  }: {
    skip?: number
    limit?: number
  } = {}): Promise<RolesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/ats/roles/",
      query: {
        skip,
        limit,
      },
    })
  }

  /**
   * Create Role
   * Create new role (Admin only)
   */
  public static createRole(data: RoleCreate): Promise<RolePublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/ats/roles/",
      body: data,
      mediaType: "application/json",
    })
  }

  /**
   * Get Role
   * Get role by ID (Admin only)
   */
  public static getRole(id: string): Promise<RolePublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/ats/roles/${id}`,
    })
  }

  /**
   * Update Role
   * Update role (Admin only)
   */
  public static updateRole(id: string, data: RoleUpdate): Promise<RolePublic> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/api/v1/ats/roles/${id}`,
      body: data,
      mediaType: "application/json",
    })
  }

  /**
   * Delete Role
   * Delete role (Admin only)
   */
  public static deleteRole(id: string): Promise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/api/v1/ats/roles/${id}`,
    })
  }

  /**
   * Get Permissions
   * Retrieve permissions (Admin only)
   */
  public static getPermissions({
    skip = 0,
    limit = 100,
  }: {
    skip?: number
    limit?: number
  } = {}): Promise<PermissionsPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/ats/permissions/",
      query: {
        skip,
        limit,
      },
    })
  }

  /**
   * Create Permission
   * Create new permission (Admin only)
   */
  public static createPermission(data: PermissionCreate): Promise<PermissionPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/ats/permissions/",
      body: data,
      mediaType: "application/json",
    })
  }

  /**
   * Get Permission Types
   * Get all available permission types (Admin only)
   */
  public static getPermissionTypes(): Promise<string[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/ats/permissions/types",
    })
  }

  /**
   * Get Permission
   * Get permission by ID (Admin only)
   */
  public static getPermission(id: string): Promise<PermissionPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/ats/permissions/${id}`,
    })
  }

  /**
   * Update Permission
   * Update permission (Admin only)
   */
  public static updatePermission(id: string, data: PermissionUpdate): Promise<PermissionPublic> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/api/v1/ats/permissions/${id}`,
      body: data,
      mediaType: "application/json",
    })
  }

  /**
   * Delete Permission
   * Delete permission (Admin only)
   */
  public static deletePermission(id: string): Promise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/api/v1/ats/permissions/${id}`,
    })
  }

  /**
   * Assign Roles to User
   * Assign roles to user (Admin only)
   */
  public static assignRolesToUser(userId: string, data: UserRoleAssign): Promise<{ message: string }> {
    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/ats/users/${userId}/roles`,
      body: data,
      mediaType: "application/json",
    })
  }

  /**
   * Remove Role from User
   * Remove role from user (Admin only)
   */
  public static removeRoleFromUser(userId: string, roleId: string): Promise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/api/v1/ats/users/${userId}/roles/${roleId}`,
    })
  }

  /**
   * Get User Roles
   * Get user roles (Admin only)
   */
  public static getUserRoles(userId: string): Promise<UserRolesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/ats/users/${userId}/roles`,
    })
  }

  /**
   * Get User Permissions
   * Get user permissions (Admin only)
   */
  public static getUserPermissions(userId: string): Promise<{
    user_id: string
    permissions: string[]
    count: number
  }> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/ats/users/${userId}/permissions`,
    })
  }

  /**
   * Get Users with Roles
   * Get all users with their roles (Admin only)
   */
  public static getUsersWithRoles({
    skip = 0,
    limit = 100,
  }: {
    skip?: number
    limit?: number
  } = {}): Promise<{
    data: Array<{
      id: string
      email: string
      full_name?: string
      is_active: boolean
      is_superuser: boolean
      roles: RolePublic[]
      permissions: string[]
      primary_role?: string
    }>
    count: number
  }> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/ats/users/with-roles",
      query: {
        skip,
        limit,
      },
    })
  }
}

// Export the ATS service as part of the main client
export * from "./ats"