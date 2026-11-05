import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { CaptchaResponse, LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest } from 'src/app/models/auth.models';

export interface CurrentUser {
  id: string;
  fullName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5045/api/Auth';
  private readonly tokenKey = 'app_auth_token';
  private readonly userKey = 'app_current_user';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  getCaptcha(): Observable<CaptchaResponse> {
    return this.http.get<CaptchaResponse>(`${this.apiUrl}/captcha`);
  }

  login(model: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, model).pipe(
      tap((response: any) => {
        const token = response?.token || response?.Token;
        if (token) {
          this.saveToken(token);

          const user = this.extractUserData(token, response);
          if (user) {
            this.saveUser(user);
          }
        }
      })
    );
  }

saveToken(token: string): void {
  sessionStorage.setItem(this.tokenKey, token);
}

getToken(): string | null {
  return sessionStorage.getItem(this.tokenKey);
}

  isAuthenticated(): boolean {
    return !!this.getToken();
  }


logout(): void {
  sessionStorage.removeItem(this.tokenKey);
  sessionStorage.removeItem(this.userKey);

  // پاک‌کردن اطلاعات قدیمی‌ای که قبلاً در localStorage ذخیره شده‌اند
  localStorage.removeItem(this.tokenKey);
  localStorage.removeItem(this.userKey);

  this.currentUserSubject.next(null);
  this.router.navigate(['/login']);
}

private saveUser(user: CurrentUser): void {
  sessionStorage.setItem(this.userKey, JSON.stringify(user));
  this.currentUserSubject.next(user);
}

private getUserFromStorage(): CurrentUser | null {
  const raw = sessionStorage.getItem(this.userKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}


  private extractUserData(token: string, response?: any): CurrentUser | null {
    try {
      const payloadBase64 = token
        .split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

 

      const decodedJson = JSON.parse(
        decodeURIComponent(escape(atob(payloadBase64)))
      );

      const fullName = response?.fullName || response?.FullName || decodedJson['FullName'] || decodedJson['fullName'] || '';
      const role = (response?.roles && response.roles.length > 0)
        ? response.roles[0]
        : (decodedJson['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedJson['role'] || 'کاربر');

const NAME_ID_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

const id: string =
  response?.guid ||
  response?.id ||
  decodedJson[NAME_ID_CLAIM] ||
  decodedJson['nameid'] ||
  decodedJson['sub'] ||
  decodedJson['guid'] ||
  '';

return { id, fullName, role };


    } catch (e) {
      console.error('Error decoding JWT token', e);
      return null;
    }
  }


  register(model: RegisterRequest): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(
    `${this.apiUrl}/register`,
    model
  );
}

updateCurrentUser(patch: Partial<CurrentUser>): void {
  const current = this.currentUserSubject.value;
  if (current) this.saveUser({ ...current, ...patch });
}

getCurrentUserSnapshot(): CurrentUser | null {
  return this.currentUserSubject.value;
}

resetPassword(model: ResetPasswordRequest): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, model);
}


}
