import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from './Core/Services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'AppointmentManagementSystem.UI';
  isAdminRoute = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.updateAdminRoute(this.router.url);

    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.loadingService.show();
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.updateAdminRoute(this.router.url);
          this.loadingService.hide();
        }
      });
  }

  private updateAdminRoute(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    // بررسی اینکه آیا آدرس با /admin شروع می‌شود یا خیر
    this.isAdminRoute = cleanUrl.startsWith('/admin');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
