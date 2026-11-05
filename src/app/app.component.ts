import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { LoadingService } from './Core/Services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'AppointmentManagementSystem.UI';
  isLoginPage = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {}

ngOnInit(): void {
  this.updateLoginPage(this.router.url);

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
        this.updateLoginPage(this.router.url);
        this.loadingService.hide();
      }
    });
}


  private updateLoginPage(url: string): void {
    this.isLoginPage = url.split('?')[0].split('#')[0] === '/login';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
