export interface RolePermissionItemDto {
  guid: string;
  name: string;
  title: string;
  module: string;
  isAssigned: boolean;
}

export interface RolePermissionsDto {
  roleGuid: string;
  roleTitle: string;
  permissions: RolePermissionItemDto[];
}

export interface UpdateRolePermissionsDto {
  permissionGuids: string[];
}
