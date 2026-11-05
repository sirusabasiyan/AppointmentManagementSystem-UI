// src/app/Core/Services/permission.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private authService: AuthService) {}

  getUserPermissions(): string[] {
    const token = this.authService.getToken();
    if (!token) return [];

    try {
      const payloadBase64 = token
        .split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const decoded = JSON.parse(decodeURIComponent(escape(atob(payloadBase64))));
      
      // در JWT های دات‌نت، ممکن است نام کلیم Permission یا permission باشد
      const permissionsClaim = decoded['Permission'] || decoded['permission'];

      if (!permissionsClaim) return [];

      if (Array.isArray(permissionsClaim)) {
        return permissionsClaim;
      }

      return [permissionsClaim];
    } catch {
      return [];
    }
  }

  hasPermission(permission: string): boolean {
    const userPermissions = this.getUserPermissions();

    // ادمین کل
    if (userPermissions.includes('System.All')) {
      return true;
    }

    return userPermissions.includes(permission);
  }
}
