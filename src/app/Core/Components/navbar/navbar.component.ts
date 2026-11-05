import { Component, ViewChild } from '@angular/core';
import { SidebarService } from 'src/app/Core/Services/sidebar.service';
import { ThemeService } from 'src/app/Core/Services/theme.service';
import { AuthService, CurrentUser } from '../../Services/auth.service';
import { Observable } from 'rxjs';
import { UserFormComponent } from 'src/app/pages/user/UserFormComponent/user-form.component';
import { UserService } from '../../Services/user.service';

declare const bootstrap: any;
@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: false
})
export class NavbarComponent {
  currentUser$: Observable<CurrentUser | null>;
  @ViewChild('profileForm') profileForm!: UserFormComponent;

  constructor(
    public sidebarService: SidebarService,
    public themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  onLogout(): void {
    this.authService.logout();
  }

openProfile(user: CurrentUser): void {
  if (!user?.id) {
    alert('شناسه کاربر یافت نشد. لطفاً دوباره وارد شوید.');
    return;
  }
  this.userService.getById(user.id).subscribe({
    next: (u) => {
      this.profileForm.openForEdit(u);
      const el = document.getElementById('profileModal');
      if (el) bootstrap.Modal.getOrCreateInstance(el).show();
    },
    error: () => alert('خطا در دریافت اطلاعات کاربر')
  });
}


onProfileSaved(): void {
  const id = this.authService.getCurrentUserSnapshot()?.id;
  if (!id) return;
  this.userService.getById(id).subscribe(u =>
    this.authService.updateCurrentUser({ fullName: u.fullName })
  );
}


  onProfileError(msg: string): void {
    alert(msg); // یا toast پروژه‌تان
  }
}
