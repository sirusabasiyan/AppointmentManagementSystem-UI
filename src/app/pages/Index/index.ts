import { Component, AfterViewInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, CurrentUser } from 'src/app/Core/Services/auth.service';
import { ThemeService } from 'src/app/Core/Services/theme.service';
import { UserService } from 'src/app/Core/Services/user.service';
import { UserFormComponent } from 'src/app/pages/user/UserFormComponent/user-form.component';

declare const bootstrap: any;

@Component({
  selector: 'app-index',
  templateUrl: './index.html',
  styleUrls: [
    '../../../assets/medic-care/css/bootstrap.min.css',
    '../../../assets/medic-care/css/bootstrap-icons.css',
    '../../../assets/medic-care/css/owl.carousel.min.css',
    '../../../assets/medic-care/css/owl.theme.default.min.css',
    '../../../assets/medic-care/css/templatemo-medic-care.css',
    './index.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class IndexComponent implements AfterViewInit {
  currentUser$: Observable<CurrentUser | null>;
  @ViewChild('profileForm') profileForm!: UserFormComponent;

  constructor(
    public themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  onLogout(): void {
    this.authService.logout();
  }


prepareProfile(user: CurrentUser): void {
  if (!user?.id) return;

  this.userService.getById(user.id).subscribe({
    next: (u) => {
      if (!this.profileForm) {
        alert('فرم پروفایل در صفحه پیدا نشد.');
        return;
      }
      this.profileForm.openForEdit(u);

      const el = document.getElementById('indexProfileModal');
      if (!el) return;
      if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
        console.error('Bootstrap هنوز لود نشده است');
        return;
      }
      const modal = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);
      modal.show();
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
    alert(msg);
  }

  ngAfterViewInit(): void {
    const scripts = [
      'assets/medic-care/js/jquery.min.js',
      'assets/medic-care/js/bootstrap.bundle.min.js',
      'assets/medic-care/js/owl.carousel.min.js',
      'assets/medic-care/js/scrollspy.min.js',
      'assets/medic-care/js/custom.js'
    ];

    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        document.body.appendChild(script);
      }
    });
  }
}
