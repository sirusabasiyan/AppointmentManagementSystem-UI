import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../Services/auth.service';
import { CaptchaResponse, LoginRequest, RegisterRequest } from 'src/app/models/auth.models';
import { PersianDatePickerComponent } from '../persian-date-picker/persian-date-picker.component';
import { AppDropdownComponent } from '../app-dropdown/app-dropdown.component';
import { LoadingService } from '../../Services/loading.service';

interface GenderOption {
  label: string;
  value: number;
}

@Component({
    selector: 'app-auth',
    standalone: true,
    imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DropdownModule,
    AppDropdownComponent,
    PersianDatePickerComponent
],
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  activeTab: 'login' | 'register' = 'login';
  isLoading: boolean = false;
  isCaptchaLoading: boolean = false;

  captchaData: CaptchaResponse | null = null;

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  showLoginPassword = false;
showRegisterPassword = false;
showConfirmPassword = false;

showForgotModal = false;
isResetLoading = false;
isResetCaptchaLoading = false;
resetCaptcha: CaptchaResponse | null = null;
showResetPassword = false;
showResetConfirm = false;
resetForm!: FormGroup;



  genderOptions: GenderOption[] = [
    { label: 'مرد', value: 1 },
    { label: 'زن', value: 2 }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadCaptcha();
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern('^09[0-9]{9}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      captchaCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      captchaKey: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern('^09[0-9]{9}$')]],
      birthDate: [null, [Validators.required]],
      gender: [1, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      captchaCode: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]],
      captchaKey: ['', [Validators.required]]
    },
    
    {
      validators: (group) => {
        const pass = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;
        const confirmCtrl = group.get('confirmPassword');
        
        if (confirm && pass !== confirm) {
          confirmCtrl?.setErrors({ ...confirmCtrl.errors, passwordMismatch: true });
        } else if (confirmCtrl?.hasError('passwordMismatch')) {
          const errors = { ...confirmCtrl.errors };
          delete errors['passwordMismatch'];
          confirmCtrl.setErrors(Object.keys(errors).length ? errors : null);
        }
        return null;
      }
    });

    this.resetForm = this.fb.group({
  mobile: ['', [Validators.required, Validators.pattern('^09[0-9]{9}$')]],
  newPassword: ['', [Validators.required, Validators.minLength(6)]],
  confirmPassword: ['', [Validators.required]],
  captchaCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
  captchaKey: ['', [Validators.required]]
}, {
  validators: (g) => {
    const c = g.get('confirmPassword');
    const mismatch = !!c?.value && g.get('newPassword')?.value !== c.value;
    if (mismatch) c?.setErrors({ ...c.errors, passwordMismatch: true });
    else if (c?.hasError('passwordMismatch')) {
      const e = { ...c.errors }; delete e['passwordMismatch'];
      c.setErrors(Object.keys(e).length ? e : null);
    }
    return null;
  }
});

  }


  loadCaptcha(): void {
    this.isCaptchaLoading = true;
    this.authService.getCaptcha().subscribe({
      next: (res) => {
        this.captchaData = res;
        this.loginForm.patchValue({
          captchaKey: res.captchaKey,
          captchaCode: ''
        });
        this.registerForm.patchValue({
            captchaKey: res.captchaKey,
            captchaCode: ''
        });
        this.isCaptchaLoading = false;
      },
      error: () => {
        this.isCaptchaLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطا',
          detail: 'خطا در بارگذاری کد امنیتی.'
        });
      }
    });
  }

  refreshCaptcha(): void {
    this.loadCaptcha();
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    if (tab === 'login' && !this.captchaData) {
      this.loadCaptcha();
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // ۱. نمایش لودینگ سراسری به مدت ۱ ثانیه
    this.loadingService.show();

    setTimeout(() => {
      this.isLoading = true;

      const payload: LoginRequest = {
        mobile: this.loginForm.value.mobile,
        password: this.loginForm.value.password, // توجه: در کد ارسالی شما به‌اشتباه مقدار هاردکد شده بود که به password فرم اصلاح شد
        captchaKey: this.loginForm.value.captchaKey,
        captchaCode: this.loginForm.value.captchaCode
      };

      this.authService.login(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadingService.hide(); // مخفی کردن لودینگ
          this.messageService.add({
            severity: 'success',
            summary: 'ورود موفق',
            detail: 'با موفقیت وارد سیستم شدید.'
          });
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.loadingService.hide(); // مخفی کردن لودینگ در صورت خطا
          const errorMessage = err?.error?.message || 'نام کاربری، رمز عبور یا کد امنیتی اشتباه است.';
          this.messageService.add({
            severity: 'error',
            summary: 'خطا در ورود',
            detail: errorMessage
          });
          this.loadCaptcha();
        }
      });
    }, 1000); // تأخیر ۱ ثانیه‌ای برای نمایش انیمیشن لودینگ
  }


onRegisterSubmit(): void {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  const formValue = this.registerForm.getRawValue();

  if (formValue.password !== formValue.confirmPassword) {
    this.messageService.add({
      severity: 'error',
      summary: 'خطا',
      detail: 'کلمه عبور و تکرار آن یکسان نیستند.'
    });
    return;
  }

  // مستقیماً رشته میلادی آماده از کامپوننت تقویم دریافت می‌شود
  const birthDate = formValue.birthDate;

  const payload: RegisterRequest = {
    firstName: formValue.firstName.trim(),
    lastName: formValue.lastName.trim(),
    mobile: formValue.mobile.trim(),
    birthDate,
    gender: Number(formValue.gender),
    password: formValue.password,
    confirmPassword: formValue.confirmPassword,
    captchaKey: formValue.captchaKey,
    captchaCode: formValue.captchaCode.trim()
  };

  this.isLoading = true;
  this.authService.register(payload).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'ثبت‌نام موفق',
        detail: response?.message || 'ثبت‌نام با موفقیت انجام شد.'
      });

      const registeredMobile = formValue.mobile;
      this.activeTab = 'login';
      this.loginForm.patchValue({
        mobile: registeredMobile,
        password: '',
        captchaCode: ''
      });
      this.loadCaptcha();
    },
    error: (err) => {
      this.isLoading = false;
      const message =
        err?.error?.message ||
        'ثبت‌نام انجام نشد. لطفاً اطلاعات واردشده را بررسی کنید.';
      this.messageService.add({
        severity: 'error',
        summary: 'خطا در ثبت‌نام',
        detail: message
      });
      this.loadCaptcha();
    }
  });
}


// متد جلوگیری از تایپ حروف در لحظه فشردن کلید
onlyNumbers(event: KeyboardEvent): boolean {
  const charCode = event.which ? event.which : event.keyCode;
  // اجازه فقط به اعداد 0 تا 9
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault();
    return false;
  }
  return true;
}

// متد پاکسازی هنگام Paste شدن متن
onMobileInput(event: Event, controlName: 'mobile', formType: 'login' | 'register'): void {
  const input = event.target as HTMLInputElement;
  // تبدیل اعداد فارسی/عربی به انگلیسی و حذف هر کاراکتر غیرعددی
  let cleanValue = input.value
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/\D/g, '')
    .slice(0, 11);

  input.value = cleanValue;

  const targetForm = formType === 'login' ? this.loginForm : this.registerForm;
  targetForm.get(controlName)?.setValue(cleanValue, { emitEvent: false });
}

openForgotModal(): void {
  this.resetForm.reset({ mobile: this.loginForm.value.mobile || '' });
  this.showForgotModal = true;
  this.loadResetCaptcha();
}

closeForgotModal(): void {
  this.showForgotModal = false;
}

loadResetCaptcha(): void {
  this.isResetCaptchaLoading = true;
  this.authService.getCaptcha().subscribe({
    next: (res) => {
      this.resetCaptcha = res;
      this.resetForm.patchValue({ captchaKey: res.captchaKey, captchaCode: '' });
      this.isResetCaptchaLoading = false;
    },
    error: () => {
      this.isResetCaptchaLoading = false;
      this.messageService.add({ severity: 'error', summary: 'خطا', detail: 'خطا در بارگذاری کد امنیتی.' });
    }
  });
}

onResetSubmit(): void {
  if (this.resetForm.invalid) {
    this.resetForm.markAllAsTouched();
    return;
  }
  const v = this.resetForm.getRawValue();
  this.isResetLoading = true;

  this.authService.resetPassword({
    mobile: v.mobile.trim(),
    newPassword: v.newPassword,
    confirmPassword: v.confirmPassword,
    captchaKey: v.captchaKey,
    captchaCode: v.captchaCode.trim()
  }).subscribe({
    next: (res) => {
      this.isResetLoading = false;
      this.messageService.add({ severity: 'success', summary: 'موفق', detail: res.message });
      this.loginForm.patchValue({ mobile: v.mobile, password: '', captchaCode: '' });
      this.closeForgotModal();
      this.loadCaptcha();
    },
    error: (err) => {
      this.isResetLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'خطا',
        detail: err?.error?.message || 'تغییر رمز عبور انجام نشد.'
      });
      this.loadResetCaptcha();
    }
  });
}


}
