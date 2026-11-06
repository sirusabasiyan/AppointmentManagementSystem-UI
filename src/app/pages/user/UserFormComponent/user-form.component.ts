import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/Core/Services/user.service';
import { User, CreateUserDto, UpdateUserDto } from 'src/app/models/user.model';
import { Role } from 'src/app/models/role.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: false
})
export class UserFormComponent implements OnChanges {
  @Input() roleOptions: Role[] = [];
  @Input() user: User | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() selfMode = false;
  @Input() modalId = 'userModal';

  @Output() saved = new EventEmitter<'create' | 'edit'>();
  @Output() operationError = new EventEmitter<string>();
  @ViewChild('userForm') userFormDirective?: NgForm;

  get closeBtnId(): string {
    return this.modalId + '_closeBtn';
  }

  isSubmitting = false;
  isRolesTouched = false;

  // مدیریت تصویر و آواتار
  selectedAvatarFile: File | null = null;
  avatarPreview: string | null = null;
  private readonly baseUrl = 'http://localhost:5045';

  model: {
    guid?: string;
    mobile: string;
    password?: string;
    firstName: string;
    lastName: string;
    nationalCode: string;
    email: string;
    gender: number;
    birthDate: any;
    isActive: boolean;
    avatar?: string;
    roleIds: string[];
  } = this.getInitialModel();

  genderOptions = [
    { label: 'مرد', value: 1 },
    { label: 'زن', value: 2 }
  ];

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  get isEditMode(): boolean {
    return this.mode === 'edit' && !!this.model.guid;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'ویرایش اطلاعات کاربر' : 'ثبت کاربر جدید';
  }

  get modalSubtitle(): string {
    return this.isEditMode
      ? `اصلاح مشخصات کاربر: ${this.user?.fullName || ''}`
      : 'شماره همراه به عنوان نام کاربری و شناسه ورود کاربر استفاده خواهد شد';
  }

  get submitText(): string {
    return this.isEditMode ? 'ذخیره تغییرات' : 'ثبت اطلاعات کاربر';
  }

  // محاسبه آدرس عکس جهت نمایش
  get avatarDisplayUrl(): string {
    if (this.avatarPreview) {
      return this.avatarPreview;
    }
    if (this.model.avatar) {
      return this.model.avatar.startsWith('http')
        ? this.model.avatar
        : `${this.baseUrl}${this.model.avatar}`;
    }
    return 'assets/images/default-avatar.png';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      if (this.mode === 'edit' && this.user) {
        this.fillModelFromUser(this.user);
      } else if (this.mode === 'create') {
        this.resetModel();
      }
    }
  }

  openForCreate(): void {
    this.mode = 'create';
    this.user = null;
    this.resetModel();
  }

openForEdit(user: User): void {
  this.mode = 'edit';
  this.user = user;
  this.fillModelFromUser(user);
  this.cdr.detectChanges(); // اجبار به سینک شدن متغیرها با اینپوت‌های html
}


  private fillModelFromUser(u: User): void {
    this.isRolesTouched = false;
    this.selectedAvatarFile = null;
    this.avatarPreview = null;

    const populatedModel = {
      guid: u.guid,
      mobile: u.mobile ?? '',
      password: '',
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      nationalCode: u.nationalCode ?? '',
      email: u.email ?? '',
      gender: u.gender ?? 1,
      birthDate: u.birthDate ? u.birthDate.toString().split('T')[0] : undefined,
      isActive: u.isActive ?? true,
      avatar: u.avatar,
      roleIds: u.roleIds ? [...u.roleIds] : []
    };

    this.model = populatedModel;

    // ۱. اجبار به اعمال تغییرات روی متغیرها
    this.cdr.detectChanges();

    // ۲. حل مشکل بار اول NgForm:
    // اگر فرم از قبل کنترل‌ها را در اختیار گرفته، مستقیماً مقادیر را روی فرم سینک کن
    if (this.userFormDirective?.form) {
      this.userFormDirective.form.patchValue({
        mobile: populatedModel.mobile,
        firstName: populatedModel.firstName,
        lastName: populatedModel.lastName,
        nationalCode: populatedModel.nationalCode,
        gender: populatedModel.gender,
        birthDate: populatedModel.birthDate,
        email: populatedModel.email
      });
      this.cdr.detectChanges();
    }
  }



  private getInitialModel() {
    return {
      guid: '',
      mobile: '',
      password: '',
      firstName: '',
      lastName: '',
      nationalCode: '',
      email: '',
      gender: 1,
      birthDate: undefined,
      isActive: true,
      avatar: '',
      roleIds: []
    };
  }

  private resetModel(): void {
    this.isRolesTouched = false;
    this.selectedAvatarFile = null;
    this.avatarPreview = null;
    this.model = this.getInitialModel();
  }

  isRoleSelected(roleId: string): boolean {
    return this.model.roleIds.includes(roleId);
  }

  onRoleChange(roleId: string, event: Event): void {
    this.isRolesTouched = true;
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.model.roleIds.includes(roleId)) {
        this.model.roleIds.push(roleId);
      }
    } else {
      this.model.roleIds = this.model.roleIds.filter(id => id !== roleId);
    }
  }

  onlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) return;
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onNumberPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(text)) {
      event.preventDefault();
    }
  }

  // متد انتخاب فایل آواتار
  onAvatarSelected(event: Event): void {
      const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 2 * 1024 * 1024) {
        this.operationError.emit('حجم فایل نباید بیشتر از ۲ مگابایت باشد.');
        input.value = '';
        return;
      }

      this.selectedAvatarFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // حذف عکس انتخاب‌شده
  removeSelectedAvatar(fileInputRef: HTMLInputElement): void {
    this.selectedAvatarFile = null;
    this.avatarPreview = null;
    fileInputRef.value = '';
  }

  submit(form: NgForm): void {
    this.isRolesTouched = true;

    if (!form.valid || this.isSubmitting) return;

    if (!this.selfMode && (!this.model.roleIds || this.model.roleIds.length === 0)) {
      this.operationError.emit('انتخاب حداقل یک نقش برای کاربر الزامی است.');
      return;
    }

    if (this.isEditMode && !this.model.guid) {
      this.operationError.emit('شناسه کاربر برای ویرایش یافت نشد.');
      return;
    }

    const payload: any = {
      mobile: this.model.mobile?.trim(),
      firstName: this.model.firstName?.trim(),
      lastName: this.model.lastName?.trim(),
      nationalCode: this.model.nationalCode?.trim() || undefined,
      email: this.model.email?.trim() || undefined,
      gender: Number(this.model.gender),
      birthDate: this.model.birthDate || undefined,
      isActive: this.model.isActive,
      roleIds: this.model.roleIds
    };

    if (this.isEditMode) {
      payload.guid = this.model.guid;
      if (this.model.password?.trim()) {
        payload.password = this.model.password.trim();
      }
    } else {
      payload.password = this.model.password?.trim();
    }

    this.isSubmitting = true;

    const request$: Observable<any> = this.isEditMode
      ? this.userService.update(this.model.guid!, payload as UpdateUserDto)
      : this.userService.create(payload as CreateUserDto);

    request$.subscribe({
      next: (response: any) => {
        // تعیین دقیق شناسه کاربر
        let targetUserId = this.isEditMode ? this.model.guid : null;

        if (!targetUserId && response) {
          if (typeof response === 'string') {
            targetUserId = response;
          } else {
            // چک کردن تمام کلیدهای احتمالی که ممکن است بک‌اند برگرداند
            targetUserId = response.guid || response.id || response.data?.guid || response.data?.id || response.userId;
          }
        }

        // اگر عکس انتخاب شده بود و شناسه را داشتیم، آپلود کن
        if (this.selectedAvatarFile && targetUserId) {
          this.uploadSelectedAvatar(targetUserId, form);
        } else {
          this.finishSubmitProcess(form);
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = this.extractErrorMessage(
          err,
          this.isEditMode ? 'خطایی در ویرایش اطلاعات کاربر رخ داد.' : 'خطایی در ثبت اطلاعات کاربر رخ داد.'
        );
        this.operationError.emit(msg);
      }
    });
  }


  // آپلود عکس بعد از ثبت/ویرایش کاربر
  private uploadSelectedAvatar(userId: string, form: NgForm): void {
    if (!this.selectedAvatarFile) {
      this.finishSubmitProcess(form);
      return;
    }

    this.userService.uploadAvatar(userId, this.selectedAvatarFile).subscribe({
      next: () => {
        this.finishSubmitProcess(form);
      },
      error: (err: any) => {
        this.finishSubmitProcess(form);
        this.operationError.emit('اطلاعات ذخیره شد، اما در آپلود تصویر خطایی رخ داد.');
      }
    });
  }

  private finishSubmitProcess(form: NgForm): void {
    this.isSubmitting = false;
    this.closeModal();

    const mode = this.isEditMode ? 'edit' : 'create';

    if (!this.isEditMode) {
      form.resetForm();
      this.resetModel();
    }

    this.saved.emit(mode);
  }

  private extractErrorMessage(err: any, defaultMsg: string): string {
    let msg = defaultMsg;
    if (err?.error?.errors && typeof err.error.errors === 'object') {
      const firstKey = Object.keys(err.error.errors)[0];
      const errorList = err.error.errors[firstKey];
      if (Array.isArray(errorList) && errorList.length > 0) msg = errorList[0];
    } else if (typeof err?.error === 'string') {
      msg = err.error;
    } else if (err?.error?.message) {
      msg = err.error.message;
    }
    return msg;
  }

  private closeModal(): void {
    const btn = document.getElementById(this.closeBtnId);
    if (btn) btn.click();
  }

  get avatarInputId(): string {
  return this.modalId + '_avatarInput';
}

}
