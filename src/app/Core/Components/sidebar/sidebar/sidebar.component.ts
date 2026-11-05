import { Component } from '@angular/core';
import { SidebarService } from 'src/app/Core/Services/sidebar.service';
import { PermissionService } from 'src/app/Core/Services/permission.service';
import { AppPermissions } from 'src/app/Core/constants/app-permissions.constants';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent {
  // دسترسی به ثابت‌ها داخل تمپلیت HTML
  readonly permissions = AppPermissions;

  constructor(
    public sidebarService: SidebarService,
    public permissionService: PermissionService
  ) {}

  closeSidebarOnMobile(): void {
    // در صفحه‌های موبایل اگر روی لینکی کلیک شد، سایدبار خودکار بسته شود
    if (window.innerWidth < 992) {
      this.sidebarService.close();
    }
  }
}
