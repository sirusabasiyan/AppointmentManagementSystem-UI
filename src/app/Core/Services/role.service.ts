import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateRoleDto, Role, UpdateRoleDto } from 'src/app/models/role.model';
import { RolePermissionsDto, UpdateRolePermissionsDto } from 'src/app/models/role-permission.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly baseUrl = 'http://localhost:5045/api/Role';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  getById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateRoleDto): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // دریافت لیست پرمیشن‌ها برای یک نقش
  getRolePermissions(roleId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${roleId}/permissions`);
  }

  // ثبت دسترسی‌های نقش
  updateRolePermissions(roleId: string, permissionGuids: string[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${roleId}/permissions`, {
      permissionGuids: permissionGuids
    });
  }
}
