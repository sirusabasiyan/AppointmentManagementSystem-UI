import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { RoleService } from 'src/app/Core/Services/role.service';
import { CreateRoleDto, Role, UpdateRoleDto } from 'src/app/models/role.model';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
  standalone: false
})
export class RoleFormComponent implements OnChanges {
  @Input() parentOptions: Role[] = [];
  @Input() role: Role | null = null;
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() saved = new EventEmitter<'create' | 'edit'>();
  @Output() operationError = new EventEmitter<string>();

  modalId = 'roleModal';
  private closeBtnId = 'closeRoleModalBtn';

  model: {
    guid?: string;
    name: string;
    title: string;
    parentRoleId: string | null;
    gKey: number;
    description: string;
    isActive: boolean;
  } = {
    guid: '',
    name: '',
    title: '',
    parentRoleId: null,
    gKey: 1,
    description: '',
    isActive: true
  };

  isSubmitting = false;

  constructor(private roleService: RoleService) {}

  get isEditMode(): boolean {
    return this.mode === 'edit' && !!this.model.guid;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'ویرایش نقش' : 'تعریف نقش جدید';
  }

  get modalSubtitle(): string {
    return this.isEditMode
      ? 'مشخصات نقش را اصلاح نمایید'
      : 'مشخصات سطح دسترسی جدید را وارد کنید';
  }

  get submitText(): string {
    return this.isEditMode ? 'ثبت تغییرات' : 'ثبت نقش';
  }

  //////////////

// در کلاس کامپوننت
preparedParentOptions: { label: string; value: any }[] = [];

// در متد ngOnChanges، این لیست را بسازید:
ngOnChanges(changes: SimpleChanges): void {
  // اگر نقش تغییر کرد یا لیست والدها تغییر کرد
  if (changes['role'] || changes['parentOptions']) {
    this.updateDropdownOptions();
  }

  if (changes['role']) {
    if (this.mode === 'edit' && this.role) {
      this.fillModelFromRole(this.role);
    } else if (this.mode === 'create') {
      this.resetModel();
    }
  }
}

// متد جدید برای ساخت لیست
private updateDropdownOptions(): void {
  const list = this.isEditMode
    ? (this.parentOptions || []).filter(p => p.guid !== this.model.guid)
    : (this.parentOptions || []);

  this.preparedParentOptions = list.map(p => ({
    label: `${p.title} (${p.name})`,
    value: p.guid
  }));
}



  /////////////////
  // جلوگیری از انتخاب خودِ نقش به‌عنوان والد خودش در زمان ویرایش
  get parentDropdownOptions(): { label: string; value: any }[] {
    const list = this.isEditMode
      ? (this.parentOptions || []).filter(p => p.guid !== this.model.guid)
      : (this.parentOptions || []);

    return list.map(p => ({
      label: `${p.title} (${p.name})`,
      value: p.guid
    }));
  }


  openForCreate(): void {
    this.mode = 'create';
    this.role = null;
    this.resetModel();
  }

  openForEdit(role: Role): void {
    this.mode = 'edit';
    this.role = role;
    this.fillModelFromRole(role);
  }

  private fillModelFromRole(r: Role): void {
    this.model = {
      guid: r.guid || (r as any).id || '',
      name: r.name ?? '',
      title: r.title ?? '',
      parentRoleId: r.parentRoleId ?? null,
      gKey: r.gKey ?? 1,
      description: r.description ?? '',
      isActive: r.isActive ?? true
    };
  }

  onlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];
    if (allowedKeys.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onNumberPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData?.getData('text') || '';
    if (!/^\d+$/.test(clipboardData)) {
      event.preventDefault();
    }
  }

  submit(form: NgForm): void {
    if (!form.valid || this.isSubmitting) return;

    if (this.isEditMode && !this.model.guid) {
      this.operationError.emit('شناسه نقش برای ویرایش یافت نشد.');
      return;
    }

    const payload: CreateRoleDto | UpdateRoleDto = {
      name: this.model.name?.trim() || '',
      title: this.model.title?.trim() || '',
      description: this.model.description?.trim() ? this.model.description.trim() : undefined,
      parentRoleId: this.model.parentRoleId || undefined,
      gKey: Number(this.model.gKey) || 1,
      isActive: this.model.isActive
    };

    this.isSubmitting = true;

    const request$: Observable<any> = this.isEditMode
      ? this.roleService.update(this.model.guid!, payload)
      : this.roleService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();

        if (!this.isEditMode) {
          form.resetForm();
          this.resetModel();
        }

        this.saved.emit(this.isEditMode ? 'edit' : 'create');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = typeof err?.error === 'string'
          ? err.error
          : (this.isEditMode ? 'خطایی در ویرایش نقش رخ داد.' : 'خطایی در ثبت نقش رخ داد.');
        this.operationError.emit(msg);
      }
    });
  }

  private resetModel(): void {
    this.model = {
      guid: '',
      name: '',
      title: '',
      parentRoleId: null,
      gKey: 1,
      description: '',
      isActive: true
    };
  }

  private closeModal(): void {
    const btn = document.getElementById(this.closeBtnId);
    if (btn) btn.click();
  }
}
