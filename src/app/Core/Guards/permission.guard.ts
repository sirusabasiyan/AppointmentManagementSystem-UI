// src/app/Core/Guards/permission.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService } from '../Services/permission.service';
import { MessageService } from 'primeng/api';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  const requiredPermission = route.data?.['permission'] as string;

  // اگر روت پرمیشن خاصی نیاز نداشت، اجازه عبور بده
  if (!requiredPermission) {
    return true;
  }

  // بررسی دسترسی
  if (permissionService.hasPermission(requiredPermission)) {
    return true;
  }

  // نمایش پیام خطا و جلوگیری از ریدایرکت‌های تکراری
  messageService.add({
    severity: 'warn',
    summary: 'عدم دسترسی',
    detail: 'شما دسترسی لازم برای مشاهده این بخش را ندارید.'
  });

  // اگر به صفحه لاگین یا صفحه بدون دسترسی هدایت شود، لوپ شکسته می‌شود
  return router.parseUrl('/login');
};
