import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

@Component({
    selector: 'app-persian-date-picker',
    imports: [
    ReactiveFormsModule,
    NgPersianDatepickerModule
],
    templateUrl: './persian-date-picker.component.html',
    styleUrls: ['./persian-date-picker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PersianDatePickerComponent),
            multi: true
        }
    ]
})
export class PersianDatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() label: string = '';
  @Input() placeholder: string = 'انتخاب تاریخ...';
  @Input() isInvalid: boolean = false;
  /** کلاس استایل‌دهی فیلد اینپوت برای یکپارچگی با بوت‌استرپ */
  @Input() inputClass: string = 'form-control py-2 text-center';

  /** کنترل داخلی؛ منبع واحد حقیقت (Single Source of Truth) برای پکیج */
  innerControl = new FormControl();

  displayValue: string = '';

  private valueSub?: Subscription;
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    // پل بین پکیج و CVA: هر تغییری در کنترل داخلی، به فرم والد منتقل می‌شود
    this.valueSub = this.innerControl.valueChanges.subscribe((value: any) => {
      const gregorianStr = this.extractGregorian(value);

      if (gregorianStr) {
        this.displayValue = gregorianStr;
        this.onChange(gregorianStr);
      } else {
        this.displayValue = '';
        this.onChange(null);
      }
      this.onTouched();
    });
  }

  ngOnDestroy(): void {
    this.valueSub?.unsubscribe();
  }

  /** استخراج تاریخ میلادی از انواع ساختار ممکن پکیج (رشته شمسی، Date، timestamp، رشته میلادی) */
  private extractGregorian(value: any): string | null {
    if (!value) return null;

    // حالت ۱: رشته شمسی با فرمت YYYY/MM/DD (فرمت واقعی پکیج)
    if (typeof value === 'string' && /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(value)) {
      const parts = value.split('/').map((p) => parseInt(p, 10));
      return this.jalaliToGregorian(parts[0], parts[1], parts[2]);
    }

    const raw = value?.detail ?? value;
    const candidate = raw?.gregorian ?? raw?.shamsi ?? raw;

    // حالت ۲: شیء Date
    if (candidate instanceof Date && !isNaN(candidate.getTime())) {
      return this.formatDate(candidate);
    }

    // حالت ۳: timestamp عددی
    if (typeof candidate === 'number') {
      return this.formatDate(new Date(candidate));
    }

    // حالت ۴: رشته میلادی (YYYY-MM-DD)
    if (typeof candidate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(candidate)) {
      return candidate.substring(0, 10);
    }

    return null;
  }

  /** تبدیل تاریخ شمسی به میلادی (الگوریتم استاندارد جلالی) */
  private jalaliToGregorian(jy: number, jm: number, jd: number): string {
    let gy = jy <= 979 ? 621 : 1600;
    jy -= jy <= 979 ? 0 : 979;

    const jm0 = jm - 1;
    let days =
      365 * jy +
      Math.floor(jy / 33) * 8 +
      Math.floor(((jy % 33) + 3) / 4) +
      78 + jd +
      (jm0 < 7 ? jm0 * 31 : Math.floor(jm0 / 2) * 30 + (jm0 % 2 ? 31 : 30) - 31);

    gy += 400 * Math.floor(days / 146097);
    days %= 146097;

    if (days > 36524) {
      gy += 100 * Math.floor(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }

    gy += 4 * Math.floor(days / 1461);
    days %= 1461;

    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }

    let gd = days + 1;
    const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    const monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let gm = 0;
    for (gm = 1; gm <= 12 && gd > monthDays[gm]; gm++) {
      gd -= monthDays[gm];
    }

    return this.formatDate(new Date(gy, gm - 1, gd));
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  writeValue(value: string | null): void {
    this.displayValue = value ?? '';
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.innerControl.disable() : this.innerControl.enable();
  }
}
