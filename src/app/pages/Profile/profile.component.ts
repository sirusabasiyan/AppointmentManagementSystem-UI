import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api'; // <--- اضافه شده برای نوتیف سراسری
import { ProfileService } from 'src/app/Core/Services/profile.service';
import { editableProfile } from './profile-form';

@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  imagePreview: string | null = null;
  model = editableProfile();

  state: 'loading' | 'ready' | 'failed' = 'loading';
  saving = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly api: ProfileService,
    private readonly messageService: MessageService, // <--- تزریق سرویس پیام سراسری
    private readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.state = 'loading';

    this.api
      .getMine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: profile => {
          this.model = editableProfile(profile);
          this.state = 'ready';
          this.cd.markForCheck();
        },
        error: (e: HttpErrorResponse) => {
          if (
            e.status === 404 &&
            e.error?.message === 'پروفایلی برای این کاربر یافت نشد.'
          ) {
            this.model = editableProfile();
            this.state = 'ready';
          } else {
            const errText = this.errorText(e, 'دریافت پروفایل ممکن نشد.');
            this.showError(errText);
            this.state = 'failed';
          }

          this.cd.markForCheck();
        }
      });
  }

  save(form: NgForm): void {
    if (
      this.state !== 'ready' ||
      this.saving ||
      form.invalid ||
      !this.model.title.trim()
    ) {
      return;
    }

    this.saving = true;

    this.api
      .saveMine(editableProfile(this.model))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: profile => {
          this.model = editableProfile(profile);
          this.showSuccess('پروفایل شما با موفقیت ذخیره شد.');
          form.form.markAsPristine();
          this.saving = false;
          this.cd.markForCheck();
        },
        error: (e: HttpErrorResponse) => {
          const errText = this.errorText(
            e,
            'ذخیره انجام نشد. اطلاعات فرم حفظ شده است.'
          );
          this.showError(errText);
          this.saving = false;
          this.cd.markForCheck();
        }
      });
  }

  private errorText(
    e: HttpErrorResponse,
    fallback: string
  ): string {
    if (e.status === 401) {
      return 'برای دسترسی دوباره وارد حساب خود شوید.';
    }

    if (e.status === 403) {
      return 'اجازه دسترسی به این صفحه را ندارید.';
    }

    if (e.status === 400 && e.error?.errors) {
      return Object.values(e.error.errors).flat().join('\n') || fallback;
    }

    return fallback;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.showError('فقط فرمت‌های تصویری (JPG, PNG, WebP) مجاز هستند.');
      return;
    }

    const reader = new FileReader();

    reader.onload = e => {
      this.imagePreview = e.target?.result as string;
      this.cd.markForCheck();
    };

    reader.readAsDataURL(file);

    this.api
      .uploadAvatar(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.model.avatarUrl = res.avatarUrl;
          this.showSuccess('تصویر پروفایل با موفقیت آپلود شد.');
          this.cd.markForCheck();
        },
        error: (e: HttpErrorResponse) => {
          const errText = this.errorText(e, 'آپلود تصویر انجام نشد.');
          this.showError(errText);
          this.cd.markForCheck();
        }
      });
  }

  onPhoneInput(
    event: Event,
    field: 'phone' | 'cellPhone'
  ): void {
    const input = event.target as HTMLInputElement;

    const cleaned = input.value
      .replace(/[۰-۹]/g, digit =>
        String(digit.charCodeAt(0) - 0x06f0)
      )
      .replace(/[٠-٩]/g, digit =>
        String(digit.charCodeAt(0) - 0x0660)
      )
      .replace(/\D/g, '')
      .slice(0, 11);

    input.value = cleaned;

    if (field === 'phone') {
      this.model.phone = cleaned || null;
    } else {
      this.model.cellPhone = cleaned || null;
    }
  }

  // متدهای کمکی برای نمایش نوتیفیکیشن سراسری
  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'موفقیت',
      detail: message,
      life: 4000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'خطا',
      detail: message,
      life: 6000
    });
  }
}
