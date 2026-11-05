export interface User {
  guid: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  nationalCode: string;
  mobile: string;
  email?: string | null;
  gender?: number | null;
  birthDate?: string | null; // به فرمت YYYY-MM-DD
  isActive: boolean;
  avatar?: string;
  roleIds?: string[];
  roleTitles?: string[];
  created?: string;
  lastLoginDate?: string | null;
}

export interface CreateUserDto {
  mobile: string;
  password?: string;
  firstName: string;
  lastName: string;
  nationalCode?: string | null;
  email?: string | null;
  gender?: number | null;
  birthDate?: string | null;
  isActive: boolean;
  avatar?: string;
  roleIds: string[];
}

export interface UpdateUserDto {
  guid: string;
  mobile: string;
  password?: string | null;
  firstName: string;
  lastName: string;
  nationalCode?: string | null;
  email?: string | null;
  gender?: number | null;
  birthDate?: string | null;
  isActive: boolean;
  avatar?: string;
  roleIds: string[];
}

