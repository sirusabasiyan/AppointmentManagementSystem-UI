import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // اگر لاگین کرده بود، نگذار وارد صفحه login شود و بفرستش داخل پنل
  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/admin/AppointmentTime']);
  }

  return true;
};
