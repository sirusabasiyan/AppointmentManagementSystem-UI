export interface Role {
  guid: string;
  name: string;
  title: string;
  parentRoleId?: string | null;
  parentRoleTitle?: string | null;
  gKey: number;
  description?: string | null;
  isActive: boolean;
  created?: string;
}

export interface CreateRoleDto {
  name: string;
  title: string;
  parentRoleId?: string | null;
  gKey: number;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateRoleDto {
  name: string;
  title: string;
  parentRoleId?: string | null;
  gKey: number;
  description?: string | null;
  isActive: boolean;
}
