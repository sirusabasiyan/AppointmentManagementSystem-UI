import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './Core/Components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { GenericTableComponent } from './shared/generic-table/generic-table.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from './Core/Components/sidebar/sidebar/sidebar.component';
import { RoleComponent } from './pages/role/role.component';
import { AppointmentTimeComponent } from './pages/AppointmentTime/AppointmentTime.component';
import { UserComponent } from './pages/user/user.component';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AuthInterceptor } from './Core/Interceptors/auth.interceptor';
import { DialogModule } from 'primeng/dialog';
import { RolePermissionsComponent } from './pages/role/role-permissions/role-permissions.component';
import { PersianDatePickerComponent } from './Core/Components/persian-date-picker/persian-date-picker.component';
import { AppDropdownComponent } from './Core/Components/app-dropdown/app-dropdown.component';
import { AppointmentTimeFormComponent } from './pages/AppointmentTime/AppointmentTimeForm/appointment-time-form.component';
import { RoleFormComponent } from './pages/role/RoleFormComponent/role-form.component';
import { UserFormComponent } from './pages/user/UserFormComponent/user-form.component';
import { LoadingComponent } from './Core/Components/Loading/loading.component';
import { LoadingInterceptor } from './Core/Interceptors/loading.interceptor';
import { IndexComponent } from './pages/Index';

@NgModule({ declarations: [
        AppComponent,
        NavbarComponent,
        SidebarComponent,
        AppointmentTimeComponent,
        AppointmentTimeFormComponent,
        RoleComponent,
        RolePermissionsComponent,
        RoleFormComponent,
        UserComponent,
        UserFormComponent,
        DashboardComponent,
        IndexComponent
        // PersianDatePickerComponent از اینجا حذف شد چون اکنون Standalone است
    ],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
    AppRoutingModule,
    FormsModule,
    GenericTableComponent,
    ToastModule,
    BrowserAnimationsModule,
    DialogModule,
    AppDropdownComponent,
    PersianDatePickerComponent,
    LoadingComponent
],

 providers: [
        MessageService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
