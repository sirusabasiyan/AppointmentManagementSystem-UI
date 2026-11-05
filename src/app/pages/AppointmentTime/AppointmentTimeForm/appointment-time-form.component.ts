import {
  Component, EventEmitter, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppointmentTimeService } from 'src/app/Core/Services/AppointmentTime.service';

type AppointmentTimeRow = any;

@Component({
  selector: 'AppointmentTimeForm',
  templateUrl: './appointment-time-form.component.html',
  styleUrls: ['./appointment-time-form.component.scss'],
  standalone: false
})
export class AppointmentTimeFormComponent implements OnChanges {

  @Input() appointmentTime?: AppointmentTimeRow;
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() saved = new EventEmitter<'create' | 'edit'>();
  @Output() operationError = new EventEmitter<string>();

  model: {
    guid?: string;
    title: string;
    startTime: string;
    endTime: string;
  } = {
    guid: '',
    title: '',
    startTime: '',
    endTime: ''
  };

  isSubmitting = false;
  timeValidationError: string | null = null;

  modalId = 'appointmentTimeModal';
  private closeBtnId = 'closeAppointmentTimeModalBtn';

  constructor(private appointmentTimeService: AppointmentTimeService) {}

  get isEditMode(): boolean {
    return this.mode === 'edit' && !!this.model.guid;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'ویرایش بازه زمانی' : 'تعریف بازه زمانی جدید';
  }

  get modalSubtitle(): string {
    return this.isEditMode
      ? 'مشخصات ساعت و عنوان را اصلاح نمایید'
      : 'اطلاعات ساعت شروع و پایان را وارد کنید';
  }

  get submitText(): string {
    return this.isEditMode ? 'ثبت تغییرات' : 'ثبت بازه زمانی';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointmentTime']) {
      if (this.mode === 'edit' && this.appointmentTime) {
        const row = this.appointmentTime;
        const guid = row.GUID ?? row.guid ?? row.id ?? '';

        this.model = {
          guid,
          title: row.title ?? '',
          startTime: (row.startTime ?? '').substring(0, 5),
          endTime: (row.endTime ?? '').substring(0, 5)
        };
      }

      if (this.mode === 'create') {
        this.resetModel();
      }

      this.timeValidationError = null;
    }
  }

  openForCreate(): void {
    this.mode = 'create';
    this.appointmentTime = undefined;
    this.resetModel();
    this.timeValidationError = null;
  }

  openForEdit(item: any): void {
    this.mode = 'edit';
    this.appointmentTime = item;
    const guid = item?.GUID ?? item?.guid ?? item?.id ?? '';

    this.model = {
      guid,
      title: item?.title ?? '',
      startTime: (item?.startTime ?? '').substring(0, 5),
      endTime: (item?.endTime ?? '').substring(0, 5)
    };

    this.timeValidationError = null;
  }

  checkTimeValidity(): boolean {
    if (this.model.startTime && this.model.endTime) {
      if (this.model.endTime <= this.model.startTime) {
        this.timeValidationError = 'ساعت پایان باید بعد از ساعت شروع باشد.';
        return false;
      }
    }
    this.timeValidationError = null;
    return true;
  }

  onSubmit(form: NgForm): void {
    if (!this.checkTimeValidity() || form.invalid || this.isSubmitting) return;

    if (this.isEditMode && !this.model.guid) {
      this.operationError.emit('شناسه رکورد یافت نشد.');
      return;
    }

    const payload = {
      title: this.model.title.trim(),
      startTime: this.model.startTime.length === 5 ? `${this.model.startTime}:00` : this.model.startTime,
      endTime: this.model.endTime.length === 5 ? `${this.model.endTime}:00` : this.model.endTime
    };

    this.isSubmitting = true;

    // تایپ صریح Observable<any> برای رفع خطای TS2349
    const request$: Observable<any> = this.isEditMode
      ? this.appointmentTimeService.UpdateAppointmentTime(this.model.guid!, payload)
      : this.appointmentTimeService.CreateAppointmentTime(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();

        if (!this.isEditMode) {
          form.resetForm();
          this.resetModel();
        }

        this.timeValidationError = null;
        this.saved.emit(this.isEditMode ? 'edit' : 'create');
      },
      error: (err: any) => { // رفع خطای TS7006 با دادن تایپ any به err
        this.isSubmitting = false;

        let msg = this.isEditMode ? 'خطا در ویرایش بازه زمانی' : 'خطا در ثبت بازه زمانی';
        if (typeof err?.error === 'string') msg = err.error;
        else if (err?.error?.errors) msg = Object.values(err.error.errors).flat().join('\n');

        this.operationError.emit(msg);
      }
    });
  }

  private resetModel(): void {
    this.model = { guid: '', title: '', startTime: '', endTime: '' };
  }

  private closeModal(): void {
    const btn = document.getElementById(this.closeBtnId);
    if (btn) btn.click();
  }
}
