export interface LoginRequest {
  mobile: string;
  password: string;
  captchaKey: string;
  captchaCode: string;
}

export interface LoginResponse {
  token: string;
  fullName?: string;
  mobile?: string;
  roles?: string[];
  permissions?: string[];
}

export interface CaptchaResponse {
  captchaKey: string;
  captchaImage: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  mobile: string;
  birthDate: string;
  gender: number;
  password: string;
  confirmPassword: string;
  captchaKey: string;
  captchaCode: string;
}

export interface ResetPasswordRequest {
  mobile: string;
  newPassword: string;
  confirmPassword: string;
  captchaKey: string;
  captchaCode: string;
}
