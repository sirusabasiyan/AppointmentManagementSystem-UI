// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleComponent } from './pages/role/role.component';
import { AppointmentTimeComponent } from './pages/AppointmentTime/AppointmentTime.component';
import { UserComponent } from './pages/user/user.component';
import { AuthComponent } from './Core/Components/auth/auth.component';
import { authGuard } from './Core/Guards/auth.guard';
import { guestGuard } from './Core/Guards/guest.guard';
import { permissionGuard } from './Core/Guards/permission.guard';
import { AppPermissions } from './Core/constants/app-permissions.constants';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { IndexComponent } from './pages/Index';

const routes: Routes = [
  // صفحه لاگین (بدون گارد برای مهمان)
  { path: 'login', component: AuthComponent, canActivate: [guestGuard] },

    // صفحه اصلی سایت (بدون سایدبار ادمین)
  { path: 'index', component: IndexComponent },

  // مسیرهای محافظت‌شده پنل ادمین
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [permissionGuard],
        data: { permission: AppPermissions.Dashboard.View }
      },
      {
        path: 'AppointmentTime',
        component: AppointmentTimeComponent,
        canActivate: [permissionGuard],
        data: { permission: AppPermissions.Appointments.View }
      },
      {
        path: 'role',
        component: RoleComponent,
        canActivate: [permissionGuard],
        data: { permission: AppPermissions.Roles.View }
      },
      {
        path: 'user',
        component: UserComponent,
        canActivate: [permissionGuard],
        data: { permission: AppPermissions.Users.View }
      },

      // اگر کاربر آدرس /admin را به تنهایی در مرورگر زد:
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // صفحه اصلی سایت: مستقیماً به داشبورد هدایت شود
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },

  // آدرس‌های اشتباه:
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
