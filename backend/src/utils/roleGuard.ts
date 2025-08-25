import { PermissionType, Permissions, Roles } from "../enums/role.enum";
import { UnauthorizedException } from "./appError";
import { RolePermissions } from "./role-permission";

export const roleGuard = (
  role: keyof typeof Roles | undefined | null,
  requiredPermissions: PermissionType[]
) => {
  // Check if role exists and is valid
  if (!role || !RolePermissions[role]) {
    throw new UnauthorizedException(
      "Invalid or missing role. You do not have the necessary permissions to perform this action"
    );
  }

  const permissions = RolePermissions[role];
  
  // If the role doesn't exist or lacks required permissions, throw an exception
  const hasPermission = requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );

  if (!hasPermission) {
    throw new UnauthorizedException(
      "You do not have the necessary permissions to perform this action"
    );
  }
};
