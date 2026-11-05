import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme-preference';
  
  // پیش‌فرض حتماً light است
  private themeSubject = new BehaviorSubject<AppTheme>(this.getInitialTheme());
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  private getInitialTheme(): AppTheme {
    const saved = localStorage.getItem(this.THEME_KEY) as AppTheme;
    // اگر کاربر قبلاً انتخابی داشته همان را برمی‌گرداند، در غیر این صورت پیش‌فرض Light است
    return saved === 'dark' ? 'dark' : 'light';
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.themeSubject.value === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: AppTheme): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  get isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }
}
