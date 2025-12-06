/**
 * Role-based access control (RBAC) and permissions system
 */

export type UserRole = "founder" | "admin" | "support" | "user"

export type Permission =
  | "create_chat"
  | "delete_chat"
  | "manage_users"
  | "manage_licenses"
  | "manage_support_tickets"
  | "manage_ai_settings"
  | "access_admin_panel"
  | "create_license_key"
  | "revoke_license_key"
  | "ban_user"
  | "reset_user_quota"
  | "modify_user_plan"
  | "view_analytics"
  | "enable_maintenance_mode"

interface RolePermissions {
  [key in UserRole]: Permission[]
}

const ROLE_PERMISSIONS: RolePermissions = {
  founder: [
    "create_chat",
    "delete_chat",
    "manage_users",
    "manage_licenses",
    "manage_support_tickets",
    "manage_ai_settings",
    "access_admin_panel",
    "create_license_key",
    "revoke_license_key",
    "ban_user",
    "reset_user_quota",
    "modify_user_plan",
    "view_analytics",
    "enable_maintenance_mode",
  ],
  admin: [
    "create_chat",
    "delete_chat",
    "manage_users",
    "manage_licenses",
    "manage_support_tickets",
    "access_admin_panel",
    "create_license_key",
    "revoke_license_key",
    "ban_user",
    "reset_user_quota",
    "modify_user_plan",
    "view_analytics",
  ],
  support: [
    "create_chat",
    "delete_chat",
    "manage_support_tickets",
    "view_analytics",
  ],
  user: ["create_chat", "delete_chat"],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

/**
 * Check if a role is an admin or founder (for simplified checks)
 */
export function isAdminRole(role: UserRole): boolean {
  return role === "admin" || role === "founder"
}

/**
 * Check if a role is a founder
 */
export function isFounder(role: UserRole): boolean {
  return role === "founder"
}

/**
 * Check if a role can manage other users
 */
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, "manage_users")
}

/**
 * Check if a role can manage licenses
 */
export function canManageLicenses(role: UserRole): boolean {
  return hasPermission(role, "manage_licenses")
}

/**
 * Check if a role can access the admin panel
 */
export function canAccessAdminPanel(role: UserRole): boolean {
  return hasPermission(role, "access_admin_panel")
}

/**
 * Check if a role can manage AI settings (founder only)
 */
export function canManageAISettings(role: UserRole): boolean {
  return hasPermission(role, "manage_ai_settings")
}

/**
 * Check if a role can enable maintenance mode (founder only)
 */
export function canEnableMaintenanceMode(role: UserRole): boolean {
  return hasPermission(role, "enable_maintenance_mode")
}
